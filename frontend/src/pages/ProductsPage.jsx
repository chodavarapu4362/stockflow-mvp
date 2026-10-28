import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { api } from '../api';

export default function ProductsPage({ 
  onOpenAddProduct, 
  onOpenEditProduct, 
  onOpenAdjustStock, 
  onOpenDeleteProduct,
  addToast 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.list({
        q: searchQuery || undefined,
        status_filter: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setProducts(res.data);
    } catch (err) {
      addToast('Failed to load products list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your organization's inventory, SKUs, and stock limits (FR-4)
          </p>
        </div>
        <button
          onClick={onOpenAddProduct}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs glass-input rounded-xl outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 flex items-center mr-1">
            <Filter className="h-3.5 w-3.5 mr-1" /> Status:
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'low_stock', label: '⚠️ Low Stock' },
            { id: 'in_stock', label: '✅ In Stock' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                statusFilter === pill.id
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
          <button
            onClick={fetchProducts}
            title="Reload list"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors ml-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-sky-400 animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-400">Scanning inventory database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-14 text-center">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-slate-400 items-center justify-center mb-3">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No items match "${searchQuery}". Try a different keyword.`
                : "You haven't added any products to this organization yet."}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenAddProduct}
                className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-sky-400 hover:to-indigo-500 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Product & SKU</th>
                  <th className="px-6 py-4">Stock on Hand</th>
                  <th className="px-6 py-4">Stock Indicator</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Cost Price</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/[0.04] transition-colors">
                    {/* Name & SKU */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{prod.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 border border-white/10 text-sky-300 rounded-md">
                          {prod.sku}
                        </span>
                        {prod.description && (
                          <span className="text-xs text-slate-400 truncate max-w-xs">
                            {prod.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quantity on Hand */}
                    <td className="px-6 py-4">
                      <div className="font-black text-white text-lg">
                        {prod.quantity_on_hand}
                      </div>
                      <span className="text-[10px] text-slate-400">units available</span>
                    </td>

                    {/* Low Stock Indicator Pill (FR-4) */}
                    <td className="px-6 py-4">
                      {prod.is_low_stock ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 border border-rose-500/30 text-rose-300 glow-rose">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Selling Price */}
                    <td className="px-6 py-4 font-bold text-slate-100 text-sm">
                      {prod.selling_price != null ? `$${prod.selling_price.toFixed(2)}` : '—'}
                    </td>

                    {/* Cost Price */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {prod.cost_price != null ? `$${prod.cost_price.toFixed(2)}` : '—'}
                    </td>

                    {/* Threshold */}
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {prod.effective_low_stock_threshold} units
                      {prod.low_stock_threshold === null && (
                        <span className="block text-[10px] text-slate-400">(org default)</span>
                      )}
                    </td>

                    {/* Actions: Adjust Stock, Edit, Delete (FR-4 & FR-5) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Inline Adjust Stock Button (FR-5) */}
                        <button
                          onClick={() => onOpenAdjustStock(prod)}
                          title="Adjust Stock (+/- units)"
                          className="px-2.5 py-1 text-sky-300 hover:text-white bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 rounded-xl transition-all inline-flex items-center space-x-1 text-xs font-bold"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Adjust</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onOpenEditProduct(prod)}
                          title="Edit Product"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onOpenDeleteProduct(prod)}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
