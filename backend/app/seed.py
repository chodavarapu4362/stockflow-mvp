from sqlalchemy.orm import Session
from app.models import Organization, User, Product
from app.auth import hash_password

def ensure_demo_data(db: Session) -> User:
    """Creates a demo organization and realistic inventory items if not already present."""
    demo_email = "demo@stockflow.io"
    user = db.query(User).filter(User.email == demo_email).first()
    if user:
        return user

    org = Organization(
        name="Apex Retail Store",
        default_low_stock_threshold=5
    )
    db.add(org)
    db.flush()

    user = User(
        email=demo_email,
        hashed_password=hash_password("Demo@123"),
        organization_id=org.id
    )
    db.add(user)
    db.flush()

    # Pre-seed realistic products
    demo_products = [
        {
            "name": "Wireless Noise-Cancelling Headphones",
            "sku": "TECH-WNC-001",
            "description": "Premium over-ear Bluetooth headphones with active noise cancellation",
            "quantity_on_hand": 18,
            "cost_price": 55.00,
            "selling_price": 129.99,
            "low_stock_threshold": 5,
        },
        {
            "name": "Mechanical Gaming Keyboard RGB",
            "sku": "TECH-KB-RGB",
            "description": "Tactile blue switches with per-key RGB backlighting",
            "quantity_on_hand": 3,  # LOW STOCK (<= 5)
            "cost_price": 32.50,
            "selling_price": 79.99,
            "low_stock_threshold": 5,
        },
        {
            "name": "Ergonomic Vertical Mouse",
            "sku": "TECH-MS-VERT",
            "description": "Wireless optical mouse engineered to prevent repetitive strain",
            "quantity_on_hand": 2,  # LOW STOCK (<= 4)
            "cost_price": 15.00,
            "selling_price": 39.50,
            "low_stock_threshold": 4,
        },
        {
            "name": "Ultra-Wide 34-Inch Curved Monitor",
            "sku": "DISP-34-CRV",
            "description": "144Hz 1440p HDR curved gaming and productivity monitor",
            "quantity_on_hand": 12,
            "cost_price": 280.00,
            "selling_price": 499.00,
            "low_stock_threshold": 4,
        },
        {
            "name": "USB-C 7-in-1 Multiport Hub",
            "sku": "ACC-USBC-HUB",
            "description": "HDMI 4K, 100W PD, SD card reader, 3x USB 3.0",
            "quantity_on_hand": 4,  # LOW STOCK (<= 5 default threshold)
            "cost_price": 14.00,
            "selling_price": 34.99,
            "low_stock_threshold": None,  # Uses org default threshold of 5!
        },
        {
            "name": "Smart Fitness Tracker Band",
            "sku": "FIT-TRK-PRO",
            "description": "Heart rate, SpO2, sleep tracking with 14-day battery life",
            "quantity_on_hand": 25,
            "cost_price": 22.00,
            "selling_price": 49.99,
            "low_stock_threshold": 6,
        },
        {
            "name": "Fast Wireless Charging Stand 15W",
            "sku": "ACC-CHG-15W",
            "description": "Qi-certified dual coil stand compatible with iOS and Android",
            "quantity_on_hand": 1,  # CRITICALLY LOW STOCK (<= 5)
            "cost_price": 8.50,
            "selling_price": 24.99,
            "low_stock_threshold": 5,
        }
    ]

    for p in demo_products:
        prod = Product(
            organization_id=org.id,
            name=p["name"],
            sku=p["sku"],
            description=p["description"],
            quantity_on_hand=p["quantity_on_hand"],
            cost_price=p["cost_price"],
            selling_price=p["selling_price"],
            low_stock_threshold=p["low_stock_threshold"],
            last_updated_by=demo_email
        )
        db.add(prod)

    db.commit()
    db.refresh(user)
    return user
