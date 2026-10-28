# StockFlow MVP – SaaS Inventory Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **StockFlow MVP (v0.1)** is a multi-tenant SaaS inventory management platform developed for the **Wexa AI Python Fullstack** assessment. It enables business owners and sellers to sign up, manage products, monitor low-stock thresholds in real-time, record stock adjustments, and oversee inventory health through a clean dashboard.

---

## 📋 Features & PRD Compliance Matrix

| Requirement | PRD Reference | Implementation Details | Status |
| :--- | :--- | :--- | :---: |
| **Authentication & Signup** | **FR-1** | Email, password hashing (bcrypt), confirm password validation, JWT access tokens. | ✅ Complete |
| **Multi-Tenant Context** | **FR-2** | Dedicated `Organization` created per tenant. All queries, products, and adjustments strictly scoped by `organization_id`. | ✅ Complete |
| **Product Model** | **FR-3** | Name, SKU (unique per org), Quantity, Cost Price, Selling Price, Threshold, `last_updated_by`, timestamps. | ✅ Complete |
| **Product CRUD** | **FR-4** | Interactive catalog table, search by SKU/Name, create/edit forms, delete with modal confirmation. | ✅ Complete |
| **Simple Stock Updates** | **FR-5** | Direct edit in product modal + inline quick stock delta control (`+/- N units` with note/reason & history). | ✅ Complete |
| **Dashboard Overview** | **FR-6** | Summary cards (Total Products, Stock on Hand, Inventory Valuation, Low Stock Alerts) + Low Stock table. | ✅ Complete |
| **Global Settings** | **FR-7** | Organization-wide Default Low Stock Threshold setting (fallback when item threshold is null). | ✅ Complete |

---

## ⚡ 1-Click Evaluation & Demo Credentials

To streamline reviewing and testing for evaluators, the app includes a **1-Click Demo Login** button on the sign-in page that automatically logs into a pre-seeded tenant organization:

- **Organization**: Apex Retail Store
- **Email**: `demo@stockflow.io`
- **Password**: `Demo@123`
- **Pre-Seeded Catalog**: 7 realistic products (electronics, accessories) featuring items above threshold and items in low-stock status for instant dashboard demonstration.

---

## 🏗️ Architecture & Technology Stack

```
stockflow-mvp/
├── backend/
│   ├── app/
│   │   ├── auth.py             # JWT token generation, bcrypt hashing & OAuth2 dependencies
│   │   ├── config.py           # Pydantic Settings & environment variables
│   │   ├── database.py         # SQLAlchemy engine & session factory (SQLite / PostgreSQL)
│   │   ├── models.py           # Organization, User, Product, StockAdjustmentLog models
│   │   ├── schemas.py          # Pydantic request/response validation schemas
│   │   ├── seed.py             # Demo organization and catalog seeder
│   │   ├── main.py             # FastAPI application & static SPA asset mounting
│   │   └── routers/
│   │       ├── auth.py         # /api/auth routes (signup, login, demo-login, me)
│   │       ├── products.py     # /api/products CRUD & /adjust-stock endpoints
│   │       ├── dashboard.py    # /api/dashboard statistics & low stock aggregation
│   │       └── settings.py     # /api/settings tenant threshold configuration
│   ├── tests/
│   │   └── test_api.py         # 5 comprehensive integration and unit test suites
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Toast, ProductModal, AdjustStockModal, ConfirmModal
│   │   ├── pages/              # AuthPage, DashboardPage, ProductsPage, SettingsPage
│   │   ├── api.js              # Axios instance with Bearer token interceptor
│   │   ├── App.jsx             # State manager, views, modal orchestration
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Dockerfile                  # Multi-stage production container
├── render.yaml                 # 1-Click Render.com deployment manifest
├── run.py                      # Unified local launch script
└── README.md
```

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11 / 3.13)
- **ORM & Database**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) with SQLite (local) and PostgreSQL support (via `DATABASE_URL`)
- **Authentication**: JWT (`pyjwt`) with salt-hashed passwords (`bcrypt`)
- **Validation**: [Pydantic V2](https://docs.pydantic.dev/)

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Python 3.10+** (tested on Python 3.13)
- **Node.js 18+** & **npm**

### 2. Installation & Launch (Single Command)

```bash
# Clone the repository
git clone <your-repo-url>
cd stockflow-mvp

# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Build Frontend assets
cd frontend
npm install
npm run build
cd ..

# 3. Run the unified fullstack server
python run.py
```

The application will be live at:
- 🌐 **Web Application**: `http://localhost:8000`
- 📖 **Interactive Swagger API Docs**: `http://localhost:8000/docs`

---

## 🧪 Automated Test Suite

Run the full automated test suite verifying tenant isolation, SKU constraints, password hashing, and stock adjustments:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

### Test Coverage Highlights:
1. `test_signup_and_login_flow`: Tenant organization auto-creation, password confirmation, bcrypt hashing, and JWT issuance.
2. `test_product_crud_and_sku_uniqueness`: Create, read, update, delete with SKU uniqueness enforced within the organization.
3. `test_stock_adjustment_and_history`: Unit delta updates (`+/-`), negative stock prevention, and adjustment audit logs.
4. `test_multi_tenant_isolation`: Verifies that Tenant A cannot view or manipulate Tenant B's inventory, and that SKUs can be safely reused across distinct tenants.
5. `test_dashboard_and_settings`: Global threshold configuration and real-time low-stock item detection.

---

## 🌐 Deployment Guide (Live URL)

### Option 1: Render.com (Recommended - Free Tier)
1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New > Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml`.
4. Click **Apply**. Render will build the React frontend, package it with FastAPI, and provision a live URL (e.g. `https://stockflow-mvp.onrender.com`).

### Option 2: Docker Container
```bash
docker build -t stockflow-mvp .
docker run -p 8000:8000 stockflow-mvp
```

---

## 🔒 Multi-Tenant Data Isolation Design

Multi-tenancy is enforced at the core data layer:
- Every table (`users`, `products`, `stock_adjustments`) has an explicit `organization_id` foreign key.
- All incoming requests require an `Authorization: Bearer <JWT>` token.
- The `get_current_user` FastAPI dependency resolves the user and binds their `organization_id`.
- Every product query, insert, update, or deletion strictly filters by `organization_id == current_user.organization_id`.
- Cross-tenant data leakage is structurally impossible.

---

## 📞 Submission Contact

- **Candidate**: Chodavarapu Hemanth
- **Email**: `chodavarapu4362@gmail.com`
- **Assessment For**: Wexa AI (Python Fullstack)
