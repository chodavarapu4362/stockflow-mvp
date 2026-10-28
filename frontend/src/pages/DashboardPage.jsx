import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  SlidersHorizontal,
  RefreshCw,
  Boxes,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

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
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="h-8 w-8 text-sky-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading inventory analytics...</p>
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
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-sm text-slate-500">
            Real-time stock summary and critical threshold monitoring (FR-6)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{total_products}</div>
            <button 
              onClick={() => setCurrentView('products')} 
              className="text-xs text-sky-600 hover:text-sky-700 font-medium inline-flex items-center"
            >
              View catalog <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">Unique SKU items managed</p>
        </div>

        {/* Sum of Quantity on Hand */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock on Hand
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{total_quantity_on_hand.toLocaleString()}</div>
          </div>
          <p className="mt-1 text-xs text-slate-400">Total units across all items</p>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Value
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${total_inventory_retail_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Cost value: ${total_inventory_cost_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Low Stock Items Alert Card */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-colors ${
          low_stock_count > 0 
            ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300' 
            : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              low_stock_count > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              Low Stock Alerts
            </span>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              low_stock_count > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {low_stock_count > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className={`text-2xl font-bold ${low_stock_count > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
              {low_stock_count}
            </div>
            {low_stock_count > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                Attention needed
              </span>
            )}
          </div>
          <p className={`mt-1 text-xs ${low_stock_count > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {low_stock_count > 0 ? 'Items at or below threshold' : 'All items sufficiently stocked'}
          </p>
        </div>
      </div>

      {/* FR-6: Low Stock Items Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Low Stock Items</h2>
              {low_stock_count > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                  {low_stock_count} Critical
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Triggered when Quantity on Hand ≤ Low Stock Threshold (FR-6)
            </p>
          </div>
          <button
            onClick={() => setCurrentView('settings')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Configure Global Threshold</span>
          </button>
        </div>

        {low_stock_items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-flex h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Inventory Levels Healthy</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no products currently falling at or below their low-stock thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Current Stock</th>
                  <th className="px-6 py-3.5">Threshold</th>
                  <th className="px-6 py-3.5">Deficit</th>
                  <th className="px-6 py-3.5 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {low_stock_items.map((prod) => {
                  const threshold = prod.effective_low_stock_threshold;
                  const deficit = Math.max(0, threshold - prod.quantity_on_hand);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{prod.name}</div>
                        {prod.description && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">{prod.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                          {prod.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          {prod.quantity_on_hand} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {threshold} units {prod.low_stock_threshold === null && <span className="text-[10px] text-slate-400">(org default)</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-rose-600">
                        -{deficit} units
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenAdjustStock(prod)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
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
