import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ThreeDBackground from './components/ThreeDBackground';
import ProductModal from './components/ProductModal';
import AdjustStockModal from './components/AdjustStockModal';
import ConfirmModal from './components/ConfirmModal';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('stockflow_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stockflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth expiration listener
  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUser(null);
      addToast('Session expired. Please sign in again.', 'warning');
    };
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  const handleAuthSuccess = (userData, tokenString) => {
    localStorage.setItem('stockflow_token', tokenString);
    localStorage.setItem('stockflow_user', JSON.stringify(userData));
    setToken(tokenString);
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    setToken(null);
    setUser(null);
    addToast('Signed out successfully', 'info');
  };

  // Product CRUD Handlers
  const handleSaveProduct = async (formData, productId) => {
    setActionLoading(true);
    try {
      if (productId) {
        await api.products.update(productId, formData);
        addToast(`Product '${formData.name}' updated successfully!`, 'success');
      } else {
        await api.products.create(formData);
        addToast(`Product '${formData.name}' created with SKU ${formData.sku}!`, 'success');
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save product';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustStock = async (productId, delta, note) => {
    setActionLoading(true);
    try {
      const res = await api.products.adjustStock(productId, delta, note);
      addToast(
        `Stock adjusted (${delta > 0 ? `+${delta}` : delta}). New quantity: ${res.data.quantity_on_hand} units!`,
        'success'
      );
      setAdjustingProduct(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to adjust stock';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    try {
      await api.products.delete(deletingProduct.id);
      addToast(`Product '${deletingProduct.name}' was deleted.`, 'success');
      setDeletingProduct(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete product';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 3D Interactive Ambient Canvas Background */}
      <ThreeDBackground />

      {/* Main App Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!token || !user ? (
          <AuthPage onAuthSuccess={handleAuthSuccess} addToast={addToast} />
        ) : (
          <>
            <Navbar
              currentView={currentView}
              setCurrentView={setCurrentView}
              user={user}
              onLogout={handleLogout}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {currentView === 'dashboard' && (
                <DashboardPage
                  key={refreshKey}
                  setCurrentView={setCurrentView}
                  onOpenAddProduct={() => setIsAddModalOpen(true)}
                  onOpenAdjustStock={(prod) => setAdjustingProduct(prod)}
                  addToast={addToast}
                />
              )}

              {currentView === 'products' && (
                <ProductsPage
                  key={refreshKey}
                  onOpenAddProduct={() => setIsAddModalOpen(true)}
                  onOpenEditProduct={(prod) => setEditingProduct(prod)}
                  onOpenAdjustStock={(prod) => setAdjustingProduct(prod)}
                  onOpenDeleteProduct={(prod) => setDeletingProduct(prod)}
                  addToast={addToast}
                />
              )}

              {currentView === 'settings' && (
                <SettingsPage
                  key={refreshKey}
                  addToast={addToast}
                  onOrgUpdated={(newName) => {
                    const updated = { ...user, organization_name: newName };
                    setUser(updated);
                    localStorage.setItem('stockflow_user', JSON.stringify(updated));
                  }}
                />
              )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-300">
                StockFlow MVP 3D &copy; 2026. Built for Wexa AI Fullstack Assessment.
              </p>
              <p className="mt-1 text-slate-500">
                FastAPI + SQLite/PostgreSQL • React + Tailwind CSS • 3D Parallax Environment
              </p>
            </footer>
          </>
        )}
      </div>

      {/* Modals */}
      {(isAddModalOpen || editingProduct) && (
        <ProductModal
          product={editingProduct}
          defaultOrgThreshold={5}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          loading={actionLoading}
        />
      )}

      {adjustingProduct && (
        <AdjustStockModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onAdjust={handleAdjustStock}
          loading={actionLoading}
        />
      )}

      {deletingProduct && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}" (SKU: ${deletingProduct.sku})? This action cannot be reversed.`}
          confirmText="Delete Product"
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeletingProduct(null)}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
