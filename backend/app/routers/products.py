from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models import Product, User, StockAdjustmentLog
from app.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    StockAdjustRequest,
    StockAdjustmentResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

def serialize_product(product: Product, org_threshold: int) -> ProductResponse:
    effective_threshold = product.low_stock_threshold if product.low_stock_threshold is not None else org_threshold
    is_low = product.quantity_on_hand <= effective_threshold
    return ProductResponse(
        id=product.id,
        organization_id=product.organization_id,
        name=product.name,
        sku=product.sku,
        description=product.description,
        quantity_on_hand=product.quantity_on_hand,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        low_stock_threshold=product.low_stock_threshold,
        effective_low_stock_threshold=effective_threshold,
        is_low_stock=is_low,
        last_updated_by=product.last_updated_by,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.get("", response_model=List[ProductResponse])
def list_products(
    q: Optional[str] = Query(None, description="Search by name or SKU"),
    status_filter: Optional[str] = Query("all", description="'all', 'low_stock', or 'in_stock'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = current_user.organization
    org_threshold = org.default_low_stock_threshold

    query = db.query(Product).filter(Product.organization_id == current_user.organization_id)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(or_(Product.name.ilike(search_term), Product.sku.ilike(search_term)))

    products = query.order_by(desc(Product.updated_at)).all()
    results = [serialize_product(p, org_threshold) for p in products]

    if status_filter == "low_stock":
        results = [p for p in results if p.is_low_stock]
    elif status_filter == "in_stock":
        results = [p for p in results if not p.is_low_stock]

    return results


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify SKU uniqueness within this tenant organization (FR-3)
    existing = db.query(Product).filter(
        Product.organization_id == current_user.organization_id,
        Product.sku == data.sku.strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{data.sku.strip()}' already exists in your organization"
        )

    product = Product(
        organization_id=current_user.organization_id,
        name=data.name.strip(),
        sku=data.sku.strip(),
        description=data.description.strip() if data.description else None,
        quantity_on_hand=data.quantity_on_hand,
        cost_price=data.cost_price,
        selling_price=data.selling_price,
        low_stock_threshold=data.low_stock_threshold,
        last_updated_by=current_user.email
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return serialize_product(product, current_user.organization.default_low_stock_threshold)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return serialize_product(product, current_user.organization.default_low_stock_threshold)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # If SKU is updated, check uniqueness within org
    if data.sku is not None and data.sku.strip() != product.sku:
        existing = db.query(Product).filter(
            Product.organization_id == current_user.organization_id,
            Product.sku == data.sku.strip(),
            Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{data.sku.strip()}' already exists in your organization"
            )
        product.sku = data.sku.strip()

    if data.name is not None:
        product.name = data.name.strip()
    if data.description is not None:
        product.description = data.description.strip() if data.description else None
    if data.quantity_on_hand is not None:
        product.quantity_on_hand = data.quantity_on_hand
    if data.cost_price is not None:
        product.cost_price = data.cost_price
    if data.selling_price is not None:
        product.selling_price = data.selling_price
    if data.low_stock_threshold is not None:
        product.low_stock_threshold = data.low_stock_threshold

    product.last_updated_by = current_user.email
    db.commit()
    db.refresh(product)

    return serialize_product(product, current_user.organization.default_low_stock_threshold)


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"detail": "Product successfully deleted"}


@router.post("/{product_id}/adjust-stock", response_model=ProductResponse)
def adjust_stock(
    product_id: int,
    data: StockAdjustRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-5: Adjust stock inline (+/- N units with note/reason)."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    qty_before = product.quantity_on_hand
    qty_after = qty_before + data.delta

    if qty_after < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Adjustment of {data.delta} units would result in negative stock ({qty_after}). Current stock is {qty_before}."
        )

    log_entry = StockAdjustmentLog(
        organization_id=current_user.organization_id,
        product_id=product.id,
        delta=data.delta,
        quantity_before=qty_before,
        quantity_after=qty_after,
        note=data.note.strip() if data.note else None,
        user_email=current_user.email
    )
    db.add(log_entry)

    product.quantity_on_hand = qty_after
    product.last_updated_by = current_user.email
    db.commit()
    db.refresh(product)

    return serialize_product(product, current_user.organization.default_low_stock_threshold)


@router.get("/{product_id}/adjustments", response_model=List[StockAdjustmentResponse])
def get_stock_adjustments(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    logs = db.query(StockAdjustmentLog).filter(
        StockAdjustmentLog.product_id == product_id,
        StockAdjustmentLog.organization_id == current_user.organization_id
    ).order_by(desc(StockAdjustmentLog.created_at)).limit(20).all()

    return logs
