from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, User
from app.schemas import DashboardSummary
from app.auth import get_current_user
from app.routers.products import serialize_product

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummary)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = current_user.organization
    org_threshold = org.default_low_stock_threshold

    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id
    ).all()

    total_products = len(products)
    total_quantity_on_hand = sum(p.quantity_on_hand for p in products)
    
    total_inventory_cost_value = sum(
        (p.quantity_on_hand * (p.cost_price or 0.0)) for p in products
    )
    total_inventory_retail_value = sum(
        (p.quantity_on_hand * (p.selling_price or 0.0)) for p in products
    )

    serialized_all = [serialize_product(p, org_threshold) for p in products]
    low_stock_items = [p for p in serialized_all if p.is_low_stock]

    return DashboardSummary(
        total_products=total_products,
        total_quantity_on_hand=total_quantity_on_hand,
        total_inventory_cost_value=round(total_inventory_cost_value, 2),
        total_inventory_retail_value=round(total_inventory_retail_value, 2),
        low_stock_count=len(low_stock_items),
        low_stock_items=low_stock_items
    )
