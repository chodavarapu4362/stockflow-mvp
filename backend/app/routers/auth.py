from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Organization
from app.schemas import UserSignup, UserLogin, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # Create new Organization record for this tenant (FR-2)
    org = Organization(
        name=data.organization_name.strip(),
        default_low_stock_threshold=5
    )
    db.add(org)
    db.flush()  # Obtain org.id

    # Create new User
    user = User(
        email=data.email.lower().strip(),
        hashed_password=hash_password(data.password),
        organization_id=org.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "org_id": org.id})
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        organization_id=org.id,
        organization_name=org.name,
        created_at=user.created_at
    )
    return Token(access_token=token, user=user_resp)


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    org = user.organization
    token = create_access_token({"sub": str(user.id), "org_id": user.organization_id})
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        organization_id=org.id,
        organization_name=org.name,
        created_at=user.created_at
    )
    return Token(access_token=token, user=user_resp)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    org = current_user.organization
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        organization_id=org.id,
        organization_name=org.name,
        created_at=current_user.created_at
    )


@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Convenient 1-click Demo Account login for testing and evaluators."""
    from app.seed import ensure_demo_data
    demo_user = ensure_demo_data(db)
    org = demo_user.organization
    token = create_access_token({"sub": str(demo_user.id), "org_id": demo_user.organization_id})
    user_resp = UserResponse(
        id=demo_user.id,
        email=demo_user.email,
        organization_id=org.id,
        organization_name=org.name,
        created_at=demo_user.created_at
    )
    return Token(access_token=token, user=user_resp)
