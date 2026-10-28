import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

from app.database import Base
from app.models import Organization, User, Product, StockAdjustmentLog
from app.schemas import (
    UserSignup,
    UserLogin,
    ProductCreate,
    ProductUpdate,
    StockAdjustRequest,
    SettingsUpdate
)
from app.routers.auth import signup, login, get_me
from app.routers.products import (
    list_products,
    create_product,
    get_product,
    update_product,
    delete_product,
    adjust_stock,
    get_stock_adjustments
)
from app.routers.dashboard import get_dashboard
from app.routers.settings import get_settings, update_settings

# In-memory SQLite for isolated, fast tests
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_signup_and_login_flow(db):
    # FR-1 & FR-2: Signup creates Organization + User
    signup_data = UserSignup(
        email="testowner@acme.com",
        password="SecurePassword123",
        confirm_password="SecurePassword123",
        organization_name="Acme Warehouse"
    )
    token_resp = signup(signup_data, db=db)
    assert token_resp.access_token is not None
    assert token_resp.user.email == "testowner@acme.com"
    assert token_resp.user.organization_name == "Acme Warehouse"

    # Login with correct password
    login_data = UserLogin(email="testowner@acme.com", password="SecurePassword123")
    login_resp = login(login_data, db=db)
    assert login_resp.access_token is not None

    # Login with incorrect password should fail
    with pytest.raises(HTTPException) as exc_info:
        login(UserLogin(email="testowner@acme.com", password="WrongPassword"), db=db)
    assert exc_info.value.status_code == 401

def test_product_crud_and_sku_uniqueness(db):
    # Signup user
    signup_data = UserSignup(
        email="user@retail.com",
        password="Password123",
        confirm_password="Password123",
        organization_name="Retail Store"
    )
    token_resp = signup(signup_data, db=db)
    user = db.query(User).filter(User.id == token_resp.user.id).first()

    # FR-4: Create Product
    prod_create = ProductCreate(
        name="Wireless Keyboard",
        sku="KB-001",
        description="Ergonomic mechanical keyboard",
        quantity_on_hand=15,
        cost_price=30.0,
        selling_price=69.99,
        low_stock_threshold=5
    )
    prod = create_product(prod_create, current_user=user, db=db)
    assert prod.id is not None
    assert prod.sku == "KB-001"
    assert prod.is_low_stock is False
    assert prod.effective_low_stock_threshold == 5

    # Enforce SKU uniqueness in same organization
    with pytest.raises(HTTPException) as exc_info:
        create_product(prod_create, current_user=user, db=db)
    assert exc_info.value.status_code == 400
    assert "already exists" in exc_info.value.detail

    # Read product
    fetched = get_product(prod.id, current_user=user, db=db)
    assert fetched.name == "Wireless Keyboard"

    # Update product
    prod_update = ProductUpdate(
        name="Wireless Keyboard v2",
        selling_price=74.99
    )
    updated = update_product(prod.id, prod_update, current_user=user, db=db)
    assert updated.name == "Wireless Keyboard v2"
    assert updated.selling_price == 74.99

    # Delete product
    del_res = delete_product(prod.id, current_user=user, db=db)
    assert del_res["detail"] == "Product successfully deleted"

    # Fetch after delete should 404
    with pytest.raises(HTTPException) as exc_info:
        get_product(prod.id, current_user=user, db=db)
    assert exc_info.value.status_code == 404

def test_stock_adjustment_and_history(db):
    # FR-5: Simple Stock Updates (+/- N units and note)
    signup_data = UserSignup(
        email="manager@store.com",
        password="Password123",
        confirm_password="Password123",
        organization_name="Store Corp"
    )
    token_resp = signup(signup_data, db=db)
    user = db.query(User).filter(User.id == token_resp.user.id).first()

    prod = create_product(ProductCreate(
        name="Gaming Mouse",
        sku="MOUSE-01",
        quantity_on_hand=10,
        low_stock_threshold=4
    ), current_user=user, db=db)

    # Adjust +5 units
    adj_resp = adjust_stock(prod.id, StockAdjustRequest(delta=5, note="Received shipment"), current_user=user, db=db)
    assert adj_resp.quantity_on_hand == 15

    # Adjust -12 units
    adj_resp2 = adjust_stock(prod.id, StockAdjustRequest(delta=-12, note="Store sales"), current_user=user, db=db)
    assert adj_resp2.quantity_on_hand == 3
    assert adj_resp2.is_low_stock is True  # 3 <= 4 threshold

    # Reject adjustment that leads to negative quantity
    with pytest.raises(HTTPException) as exc_info:
        adjust_stock(prod.id, StockAdjustRequest(delta=-10, note="Too many sold"), current_user=user, db=db)
    assert exc_info.value.status_code == 400
    assert "negative stock" in exc_info.value.detail

    # Check adjustment logs
    logs = get_stock_adjustments(prod.id, current_user=user, db=db)
    assert len(logs) == 2
    assert logs[0].delta == -12
    assert logs[0].note == "Store sales"
    assert logs[1].delta == 5

def test_multi_tenant_isolation(db):
    # FR-2: All data is scoped by organization. No cross-tenant data leaks.
    # Tenant 1: Org A
    t1 = signup(UserSignup(
        email="ownerA@orgA.com",
        password="Password123",
        confirm_password="Password123",
        organization_name="Org A"
    ), db=db)
    userA = db.query(User).filter(User.id == t1.user.id).first()

    # Tenant 2: Org B
    t2 = signup(UserSignup(
        email="ownerB@orgB.com",
        password="Password123",
        confirm_password="Password123",
        organization_name="Org B"
    ), db=db)
    userB = db.query(User).filter(User.id == t2.user.id).first()

    # Org A creates a product
    prodA = create_product(ProductCreate(
        name="Product Alpha",
        sku="SKU-COMMON",
        quantity_on_hand=50
    ), current_user=userA, db=db)

    # Org B lists products -> should be empty
    orgB_prods = list_products(q=None, status_filter="all", current_user=userB, db=db)
    assert len(orgB_prods) == 0

    # Org B trying to access Org A product ID -> 404
    with pytest.raises(HTTPException) as exc_info:
        get_product(prodA.id, current_user=userB, db=db)
    assert exc_info.value.status_code == 404

    # Org B can use the same SKU "SKU-COMMON" because uniqueness is per org
    prodB = create_product(ProductCreate(
        name="Product Beta",
        sku="SKU-COMMON",
        quantity_on_hand=5
    ), current_user=userB, db=db)
    assert prodB.id != prodA.id
    assert prodB.sku == "SKU-COMMON"

def test_dashboard_and_settings(db):
    # FR-6: Dashboard Overview & FR-7: Global Settings
    t = signup(UserSignup(
        email="boss@analytics.com",
        password="Password123",
        confirm_password="Password123",
        organization_name="Analytics Corp"
    ), db=db)
    user = db.query(User).filter(User.id == t.user.id).first()

    # Default org low stock threshold is 5
    settings_data = get_settings(current_user=user)
    assert settings_data.default_low_stock_threshold == 5

    # Add 2 products: 1 normal, 1 low stock
    create_product(ProductCreate(
        name="High Stock Item",
        sku="HIGH-01",
        quantity_on_hand=20,
        cost_price=10.0,
        selling_price=20.0,
        low_stock_threshold=5
    ), current_user=user, db=db)

    create_product(ProductCreate(
        name="Low Stock Item",
        sku="LOW-01",
        quantity_on_hand=3,
        cost_price=5.0,
        selling_price=15.0,
        low_stock_threshold=None  # Falls back to org default of 5 -> 3 <= 5 = True!
    ), current_user=user, db=db)

    # Dashboard check
    dash = get_dashboard(current_user=user, db=db)
    assert dash.total_products == 2
    assert dash.total_quantity_on_hand == 23
    assert dash.total_inventory_cost_value == (20 * 10.0) + (3 * 5.0)  # 215.0
    assert dash.low_stock_count == 1
    assert len(dash.low_stock_items) == 1
    assert dash.low_stock_items[0].sku == "LOW-01"

    # Update org settings: change default threshold to 2
    update_settings(SettingsUpdate(default_low_stock_threshold=2), current_user=user, db=db)

    # Now the item with quantity 3 and no explicit threshold (3 > 2) is NO LONGER low stock!
    dash2 = get_dashboard(current_user=user, db=db)
    assert dash2.low_stock_count == 0
    assert len(dash2.low_stock_items) == 0
