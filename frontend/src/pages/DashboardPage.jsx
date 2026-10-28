import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  SlidersHorizontal,
  RefreshCw,
  Boxes,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import TiltCard from '../components/TiltCard';

export default function DashboardPage({ setCurrentView, onOpenAddProduct, onOpenAdjustStock, addToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.get();
      setData(res.data);
    } catch (err) {
      addToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="h-9 w-9 text-sky-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Synchronizing 3D Inventory Analytics...</p>
        </div>
      </div>
    );
  }

  const {
    total_products = 0,
    total_quantity_on_hand = 0,
    total_inventory_cost_value = 0,
    total_inventory_retail_value = 0,
    low_stock_count = 0,
    low_stock_items = []
  } = data || {};

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Inventory Dashboard
            </h1>
            <span className="flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300">
              <Sparkles className="h-3 w-3 mr-1" /> Live Real-Time
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stock summary and critical threshold monitoring (FR-6)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Elevated 3D Tilt Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <TiltCard maxTilt={6} className="rounded-2xl">
          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Products
              </span>
              <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shadow-inner">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-black text-white">{total_products}</div>
              <button 
                onClick={() => setCurrentView('products')} 
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center"
              >
                Catalog <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">Unique SKU items managed</p>
          </div>
        </TiltCard>

        {/* Stock on Hand */}
        <TiltCard maxTilt={6} className="rounded-2xl">
          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Stock on Hand
              </span>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shadow-inner">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">{total_quantity_on_hand.toLocaleString()}</div>
            </div>
            <p className="mt-1 text-xs text-slate-400">Total physical units in stock</p>
          </div>
        </TiltCard>

        {/* Inventory Valuation */}
        <TiltCard maxTilt={6} className="rounded-2xl">
          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Inventory Value
              </span>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-inner">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">
                ${total_inventory_retail_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Cost: ${total_inventory_cost_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </TiltCard>

        {/* Low Stock Items Alert Card */}
        <TiltCard maxTilt={6} className="rounded-2xl">
          <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
            low_stock_count > 0 
              ? 'glass-card border-rose-500/40 glow-rose' 
              : 'glass-card border-emerald-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                low_stock_count > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                Low Stock Alerts
              </span>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                low_stock_count > 0 
                  ? 'bg-rose-500/20 border border-rose-400/40 text-rose-400 animate-pulse' 
                  : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400'
              }`}>
                {low_stock_count > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className={`text-3xl font-black ${low_stock_count > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {low_stock_count}
              </div>
              {low_stock_count > 0 && (
                <span className="text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <p className={`mt-1 text-xs ${low_stock_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {low_stock_count > 0 ? 'Items at or below threshold' : 'All items sufficiently stocked'}
            </p>
          </div>
        </TiltCard>
      </div>

      {/* FR-6: Low Stock Items Section */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-4.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.02]">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Low Stock Items</h2>
              {low_stock_count > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/20 border border-rose-400/30 text-rose-300 rounded-full">
                  {low_stock_count} Critical
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Triggered when Quantity on Hand ≤ Low Stock Threshold (FR-6)
            </p>
          </div>
          <button
            onClick={() => setCurrentView('settings')}
            className="flex items-center space-x-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Configure Global Threshold</span>
          </button>
        </div>

        {low_stock_items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">Inventory Healthy</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no products currently falling at or below their low-stock thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4">Deficit</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {low_stock_items.map((prod) => {
                  const threshold = prod.effective_low_stock_threshold;
                  const deficit = Math.max(0, threshold - prod.quantity_on_hand);

                  return (
                    <tr key={prod.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{prod.name}</div>
                        {prod.description && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">{prod.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-800/90 border border-white/10 text-sky-300 rounded-lg">
                          {prod.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 border border-rose-500/30 text-rose-300">
                          {prod.quantity_on_hand} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300">
                        {threshold} units {prod.low_stock_threshold === null && <span className="text-[10px] text-slate-400">(org default)</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-rose-400">
                        -{deficit} units
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenAdjustStock(prod)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 transition-all shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Restock (FR-5)</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
