from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import SettingsUpdate, SettingsResponse
from app.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
def get_settings(current_user: User = Depends(get_current_user)):
    org = current_user.organization
    return SettingsResponse(
        organization_id=org.id,
        name=org.name,
        default_low_stock_threshold=org.default_low_stock_threshold,
        user_email=current_user.email,
        created_at=org.created_at
    )

@router.put("", response_model=SettingsResponse)
def update_settings(
    data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = current_user.organization
    if data.default_low_stock_threshold is not None:
        if data.default_low_stock_threshold < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Default low stock threshold must be a non-negative integer"
            )
        org.default_low_stock_threshold = data.default_low_stock_threshold

    if data.name is not None and data.name.strip():
        org.name = data.name.strip()

    db.commit()
    db.refresh(org)

    return SettingsResponse(
        organization_id=org.id,
        name=org.name,
        default_low_stock_threshold=org.default_low_stock_threshold,
        user_email=current_user.email,
        created_at=org.created_at
    )
