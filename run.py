import os
import sys
import subprocess

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dist = os.path.join(root_dir, "frontend", "dist")

    print("=" * 65)
    print("      StockFlow MVP - SaaS Multi-Tenant Inventory System")
    print("=" * 65)
    print(f"[*] Root Directory: {root_dir}")
    print(f"[*] Backend Directory: {backend_dir}")
    print(f"[*] Frontend Dist: {'Found' if os.path.isdir(frontend_dist) else 'Not built (run npm run build in frontend)'}")
    print("-" * 65)
    print("🚀 Starting Server on http://127.0.0.1:8000 ...")
    print("📖 Interactive API Docs: http://127.0.0.1:8000/docs")
    print("🔑 Demo User: demo@stockflow.io | Password: Demo@123")
    print("=" * 65)

    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)

    try:
        import uvicorn
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n[!] Server stopped.")

if __name__ == "__main__":
    main()
