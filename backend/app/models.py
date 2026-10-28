import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    default_low_stock_threshold = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    organization = relationship("Organization", back_populates="users")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    quantity_on_hand = Column(Integer, default=0, nullable=False)
    cost_price = Column(Float, nullable=True)
    selling_price = Column(Float, nullable=True)
    low_stock_threshold = Column(Integer, nullable=True)
    last_updated_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        UniqueConstraint("organization_id", "sku", name="uq_org_product_sku"),
    )

    organization = relationship("Organization", back_populates="products")
    adjustments = relationship("StockAdjustmentLog", back_populates="product", cascade="all, delete-orphan")


class StockAdjustmentLog(Base):
    __tablename__ = "stock_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    delta = Column(Integer, nullable=False)
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    note = Column(String(255), nullable=True)
    user_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    product = relationship("Product", back_populates="adjustments")
