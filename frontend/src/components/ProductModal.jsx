import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Edit2 } from 'lucide-react';

export default function ProductModal({ product, defaultOrgThreshold, onClose, onSave, loading }) {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity_on_hand: 0,
    cost_price: '',
    selling_price: '',
    low_stock_threshold: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        quantity_on_hand: product.quantity_on_hand ?? 0,
        cost_price: product.cost_price != null ? product.cost_price : '',
        selling_price: product.selling_price != null ? product.selling_price : '',
        low_stock_threshold: product.low_stock_threshold != null ? product.low_stock_threshold : '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim() || null,
      quantity_on_hand: parseInt(formData.quantity_on_hand, 10) || 0,
      cost_price: formData.cost_price === '' ? null : parseFloat(formData.cost_price),
      selling_price: formData.selling_price === '' ? null : parseFloat(formData.selling_price),
      low_stock_threshold: formData.low_stock_threshold === '' ? null : parseInt(formData.low_stock_threshold, 10),
    };

    onSave(payload, product ? product.id : null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              {isEditing ? <Edit2 className="h-4 w-4" /> : <PackagePlus className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update product details and inventory settings' : 'FR-4: Create a new inventory item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* SKU & Quantity on Hand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. TECH-WNC-001"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none uppercase"
              />
              <span className="text-[10px] text-slate-400">Must be unique per organization</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity on Hand <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="quantity_on_hand"
                min="0"
                required
                value={formData.quantity_on_hand}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Cost Price & Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                name="cost_price"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price ($)
              </label>
              <input
                type="number"
                name="selling_price"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Low Stock Threshold (Units)
            </label>
            <input
              type="number"
              name="low_stock_threshold"
              min="0"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              placeholder={`Leave blank to use org default (${defaultOrgThreshold ?? 5})`}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
            <span className="text-[10px] text-slate-400">
              Trigger low-stock alert when quantity ≤ this number. Default is {defaultOrgThreshold ?? 5}.
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description or notes..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
