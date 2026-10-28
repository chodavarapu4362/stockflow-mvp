from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

# ----------------- Auth Schemas -----------------
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    confirm_password: str = Field(..., min_length=6)
    organization_name: str = Field(..., min_length=2, max_length=100, description="Organization or Store Name")

    @model_validator(mode="after")
    def verify_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    default_low_stock_threshold: int
    created_at: datetime


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    organization_id: int
    organization_name: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Product Schemas -----------------
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    quantity_on_hand: int = Field(default=0, ge=0)
    cost_price: Optional[float] = Field(default=None, ge=0)
    selling_price: Optional[float] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    quantity_on_hand: Optional[int] = Field(default=None, ge=0)
    cost_price: Optional[float] = Field(default=None, ge=0)
    selling_price: Optional[float] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    name: str
    sku: str
    description: Optional[str] = None
    quantity_on_hand: int
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    low_stock_threshold: Optional[int] = None
    effective_low_stock_threshold: int
    is_low_stock: bool
    last_updated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class StockAdjustRequest(BaseModel):
    delta: int = Field(..., description="Units to adjust (+/- integer, e.g. +10 or -5)")
    note: Optional[str] = Field(default=None, max_length=255, description="Reason or note for adjustment")


class StockAdjustmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    delta: int
    quantity_before: int
    quantity_after: int
    note: Optional[str]
    user_email: Optional[str]
    created_at: datetime


# ----------------- Dashboard Schemas -----------------
class DashboardSummary(BaseModel):
    total_products: int
    total_quantity_on_hand: int
    total_inventory_cost_value: float
    total_inventory_retail_value: float
    low_stock_count: int
    low_stock_items: List[ProductResponse]


# ----------------- Settings Schemas -----------------
class SettingsUpdate(BaseModel):
    default_low_stock_threshold: Optional[int] = Field(default=None, ge=0)
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)


class SettingsResponse(BaseModel):
    organization_id: int
    name: str
    default_low_stock_threshold: int
    user_email: str
    created_at: datetime
