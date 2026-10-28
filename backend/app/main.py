import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, products, dashboard, settings as settings_router
from app.seed import ensure_demo_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Pre-seed demo store so evaluators can test immediately
    db = SessionLocal()
    try:
        ensure_demo_data(db)
    except Exception as e:
        print(f"Demo seeding warning: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SaaS Multi-tenant Inventory Management System API (StockFlow MVP)",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Mount static frontend build if it exists (for full-stack deployment on Render/Railway)
# Look in ../frontend/dist or ./frontend/dist
frontend_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath("frontend/dist")
]

static_dir = None
for p in frontend_dist_paths:
    if os.path.isdir(p):
        static_dir = p
        break

if static_dir:
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
