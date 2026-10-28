"""
End-to-End Verification Script for StockFlow MVP
Tests all requirements FR-1 through FR-7 programmatically.
"""
import sys
import os
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app.database import Base, engine, SessionLocal
from app.models import User, Organization, Product, StockAdjustmentLog
from app.schemas import UserSignup, UserLogin, ProductCreate, ProductUpdate, StockAdjustRequest, SettingsUpdate
from app.routers.auth import signup, login, demo_login
from app.routers.products import list_products, create_product, get_product, update_product, delete_product, adjust_stock, get_stock_adjustments
from app.routers.dashboard import get_dashboard
from app.routers.settings import get_settings, update_settings

def run_e2e_verification():
    print("=" * 60)
    print("  StockFlow MVP (v0.1) End-to-End Verification Test")
    print("=" * 60)

    # 1. Database Init (Fresh In-Memory Test Engine)
    from sqlalchemy.pool import StaticPool
    from sqlalchemy import create_engine
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSession()

    try:
        # FR-1 & FR-2: Signup & Tenant Organization
        print("[1/7] Testing FR-1 & FR-2: Signup & Organization Context...")
        signup_data = UserSignup(
            email="tester@wexa.ai",
            password="Password@123",
            confirm_password="Password@123",
            organization_name="Wexa Test Store"
        )
        auth_resp = signup(signup_data, db=db)
        user = db.query(User).filter(User.id == auth_resp.user.id).first()
        assert user is not None
        assert user.organization.name == "Wexa Test Store"
        print(f"      -> Created Tenant Org: '{user.organization.name}' (ID: {user.organization_id}) for user '{user.email}'")

        # FR-3 & FR-4: Product Model & CRUD
        print("[2/7] Testing FR-3 & FR-4: Product Model & CRUD...")
        p1 = create_product(ProductCreate(
            name="Pro Wireless Mouse",
            sku="MS-PRO-01",
            description="Ultra-lightweight gaming mouse",
            quantity_on_hand=8,
            cost_price=25.00,
            selling_price=59.99,
            low_stock_threshold=5
        ), current_user=user, db=db)
        assert p1.id is not None
        assert p1.sku == "MS-PRO-01"
        assert p1.is_low_stock is False
        print(f"      -> Created Product: '{p1.name}' (SKU: {p1.sku}, Stock: {p1.quantity_on_hand}, LowStock: {p1.is_low_stock})")

        # Test SKU uniqueness enforcement in same org
        try:
            create_product(ProductCreate(
                name="Duplicate SKU Item",
                sku="MS-PRO-01",
                quantity_on_hand=1
            ), current_user=user, db=db)
            raise AssertionError("Failed to block duplicate SKU in same tenant!")
        except Exception as e:
            assert "already exists in your organization" in str(e)
            print("      -> Successfully prevented duplicate SKU in same tenant.")

        # FR-5: Simple Stock Updates (+/- Delta & Note)
        print("[3/7] Testing FR-5: Simple Stock Updates (+/- Delta & Note)...")
        # Adjust stock: sell 4 units (-4)
        adj_res = adjust_stock(p1.id, StockAdjustRequest(delta=-4, note="Sold 4 units to customer"), current_user=user, db=db)
        assert adj_res.quantity_on_hand == 4
        assert adj_res.is_low_stock is True  # 4 <= 5 threshold!
        print(f"      -> Stock reduced by 4. New Quantity: {adj_res.quantity_on_hand}. Low-Stock Flag: {adj_res.is_low_stock}")

        # Verify adjustment logs
        logs = get_stock_adjustments(p1.id, current_user=user, db=db)
        assert len(logs) == 1
        assert logs[0].delta == -4
        assert logs[0].note == "Sold 4 units to customer"
        print("      -> Stock adjustment audit log verified.")

        # Negative stock protection test
        try:
            adjust_stock(p1.id, StockAdjustRequest(delta=-10, note="Invalid sale"), current_user=user, db=db)
            raise AssertionError("Failed to block negative stock adjustment!")
        except Exception as e:
            assert "negative stock" in str(e)
            print("      -> Negative stock prevention verified.")

        # FR-6: Dashboard Overview
        print("[4/7] Testing FR-6: Dashboard Overview...")
        dash = get_dashboard(current_user=user, db=db)
        assert dash.total_products == 1
        assert dash.total_quantity_on_hand == 4
        assert dash.low_stock_count == 1
        assert len(dash.low_stock_items) == 1
        assert dash.low_stock_items[0].sku == "MS-PRO-01"
        print(f"      -> Dashboard Stats: Total Products={dash.total_products}, Stock={dash.total_quantity_on_hand}, LowStock={dash.low_stock_count}")

        # FR-7: Global Settings (Default Low Stock Threshold)
        print("[5/7] Testing FR-7: Global Settings...")
        settings_curr = get_settings(current_user=user)
        assert settings_curr.default_low_stock_threshold == 5
        print(f"      -> Current Org Default Threshold: {settings_curr.default_low_stock_threshold}")

        # Create item with None low_stock_threshold (falls back to global threshold)
        p2 = create_product(ProductCreate(
            name="Keyboard Wrist Rest",
            sku="ACC-WRIST-01",
            quantity_on_hand=3,
            low_stock_threshold=None  # Falls back to global threshold 5 -> 3 <= 5 = Low Stock
        ), current_user=user, db=db)
        assert p2.effective_low_stock_threshold == 5
        assert p2.is_low_stock is True

        # Now change global default threshold to 2
        update_settings(SettingsUpdate(default_low_stock_threshold=2), current_user=user, db=db)
        dash_updated = get_dashboard(current_user=user, db=db)
        # With threshold 2: item with quantity 3 is NO LONGER low stock!
        low_skus = [i.sku for i in dash_updated.low_stock_items]
        assert "ACC-WRIST-01" not in low_skus
        print("      -> Successfully verified global default threshold dynamically governs low stock items!")

        # Multi-Tenant Data Isolation Test
        print("[6/7] Testing Multi-Tenant Data Isolation...")
        # Signup Tenant B
        b_auth = signup(UserSignup(
            email="tenant_b@other.com",
            password="Password@123",
            confirm_password="Password@123",
            organization_name="Tenant B Store"
        ), db=db)
        user_b = db.query(User).filter(User.id == b_auth.user.id).first()

        # Tenant B cannot see Tenant A's products
        b_products = list_products(q=None, status_filter="all", current_user=user_b, db=db)
        assert len(b_products) == 0

        # Tenant B can use the same SKU MS-PRO-01 without conflict
        b_p = create_product(ProductCreate(
            name="Tenant B Mouse",
            sku="MS-PRO-01",
            quantity_on_hand=100
        ), current_user=user_b, db=db)
        assert b_p.sku == "MS-PRO-01"
        assert b_p.organization_id != user.organization_id
        print("      -> Cross-tenant data isolation verified: zero leakage, scoped SKUs.")

        # 1-Click Demo Account Verification
        print("[7/7] Testing 1-Click Demo Account Seeder...")
        demo_resp = demo_login(db=db)
        assert demo_resp.user.email == "demo@stockflow.io"
        assert demo_resp.user.organization_name == "Apex Retail Store"
        demo_user = db.query(User).filter(User.id == demo_resp.user.id).first()
        demo_prods = list_products(q=None, status_filter="all", current_user=demo_user, db=db)
        assert len(demo_prods) >= 7
        print(f"      -> Demo store 'Apex Retail Store' loaded with {len(demo_prods)} pre-seeded products.")

        print("=" * 60)
        print("  SUCCESS: ALL 7 REQUIREMENTS (FR-1 TO FR-7) FULLY PASSED!")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    run_e2e_verification()
