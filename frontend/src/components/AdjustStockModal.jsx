import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, Plus, Minus } from 'lucide-react';

export default function AdjustStockModal({ product, onClose, onAdjust, loading }) {
  const [delta, setDelta] = useState(1);
  const [note, setNote] = useState('');

  if (!product) return null;

  const currentQty = product.quantity_on_hand;
  const newQty = currentQty + Number(delta || 0);
  const isInvalid = newQty < 0 || isNaN(delta) || Number(delta) === 0;

  const handleQuickDelta = (value) => {
    setDelta(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInvalid) return;
    onAdjust(product.id, Number(delta), note);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Adjust Stock Level</h3>
            <p className="text-xs text-slate-500">FR-5: Quick stock delta update</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-sm font-semibold text-slate-900">{product.name}</div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>SKU: <strong className="font-mono text-slate-700">{product.sku}</strong></span>
              <span>•</span>
              <span>Threshold: {product.effective_low_stock_threshold} units</span>
            </div>
          </div>

          {/* Quantity Change Visualizer */}
          <div className="flex items-center justify-between p-4 bg-sky-50/60 border border-sky-100 rounded-xl">
            <div className="text-center flex-1">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current</div>
              <div className="text-2xl font-bold text-slate-800">{currentQty}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-sky-400 shrink-0" />
            <div className="text-center flex-1">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Adjustment</div>
              <div className={`text-2xl font-bold ${Number(delta) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Number(delta) > 0 ? `+${delta}` : delta}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-sky-400 shrink-0" />
            <div className="text-center flex-1">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">New Total</div>
              <div className={`text-2xl font-bold ${newQty < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {newQty}
              </div>
            </div>
          </div>

          {newQty < 0 && (
            <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Stock cannot be negative. Maximum reduction possible is -{currentQty}.</span>
            </div>
          )}

          {/* Quick Adjustment Pills */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Quick Buttons</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[-5, -1, 1, 5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickDelta(val)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                    Number(delta) === val
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Delta Manual Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Units (+/- integer)
            </label>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. +10 or -5"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Note / Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason or Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Weekly supplier restock, damaged return, cycle count"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
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
              disabled={loading || isInvalid}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              {loading ? 'Updating...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
