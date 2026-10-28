import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Tag
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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'low_stock', 'in_stock'

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500">
            Manage your organization's inventory, SKUs, and stock limits (FR-4)
          </p>
        </div>
        <button
          onClick={onOpenAddProduct}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
          <button
            onClick={fetchProducts}
            title="Reload list"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="h-7 w-7 text-sky-600 animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Searching inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-12 w-12 rounded-full bg-slate-100 text-slate-400 items-center justify-center mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No items match "${searchQuery}". Try a different keyword.`
                : "You haven't added any products to this organization yet."}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenAddProduct}
                className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Stock on Hand</th>
                  <th className="px-6 py-3.5">Stock Indicator</th>
                  <th className="px-6 py-3.5">Selling Price</th>
                  <th className="px-6 py-3.5">Cost Price</th>
                  <th className="px-6 py-3.5">Threshold</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & SKU */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{prod.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
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
                      <div className="font-bold text-slate-900 text-base">
                        {prod.quantity_on_hand}
                      </div>
                      <span className="text-[10px] text-slate-400">units available</span>
                    </td>

                    {/* Low Stock Indicator Pill (FR-4) */}
                    <td className="px-6 py-4">
                      {prod.is_low_stock ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Selling Price */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {prod.selling_price != null ? `$${prod.selling_price.toFixed(2)}` : '—'}
                    </td>

                    {/* Cost Price */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {prod.cost_price != null ? `$${prod.cost_price.toFixed(2)}` : '—'}
                    </td>

                    {/* Threshold */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {prod.effective_low_stock_threshold} units
                      {prod.low_stock_threshold === null && (
                        <span className="block text-[10px] text-slate-400">(org default)</span>
                      )}
                    </td>

                    {/* Actions: Adjust Stock, Edit, Delete (FR-4 & FR-5) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Inline Adjust Stock Button (FR-5) */}
                        <button
                          onClick={() => onOpenAdjustStock(prod)}
                          title="Adjust Stock (+/- units)"
                          className="p-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors inline-flex items-center space-x-1 text-xs font-semibold px-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Adjust</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onOpenEditProduct(prod)}
                          title="Edit Product"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onOpenDeleteProduct(prod)}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
