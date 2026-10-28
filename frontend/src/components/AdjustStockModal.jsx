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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-md w-full shadow-2xl border border-white/15 overflow-hidden animate-scale-up relative">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div>
            <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400">FR-5: Quick stock delta update</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-xl p-1.5 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Summary */}
          <div className="p-4 rounded-2xl glass-card border border-white/10">
            <div className="text-sm font-bold text-white">{product.name}</div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
              <span>SKU: <strong className="font-mono text-sky-300">{product.sku}</strong></span>
              <span>•</span>
              <span>Threshold: {product.effective_low_stock_threshold} units</span>
            </div>
          </div>

          {/* 3D Quantity Change Visualizer */}
          <div className="flex items-center justify-between p-4 bg-sky-950/30 border border-sky-400/30 rounded-2xl">
            <div className="text-center flex-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current</div>
              <div className="text-2xl font-black text-white mt-0.5">{currentQty}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-sky-400 shrink-0" />
            <div className="text-center flex-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delta</div>
              <div className={`text-2xl font-black mt-0.5 ${Number(delta) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Number(delta) > 0 ? `+${delta}` : delta}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-sky-400 shrink-0" />
            <div className="text-center flex-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">New Total</div>
              <div className={`text-2xl font-black mt-0.5 ${newQty < 0 ? 'text-rose-400' : 'text-sky-300'}`}>
                {newQty}
              </div>
            </div>
          </div>

          {newQty < 0 && (
            <div className="flex items-center space-x-2 text-xs text-rose-300 bg-rose-500/20 p-3 rounded-xl border border-rose-500/30">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>Stock cannot be negative. Maximum reduction possible is -{currentQty}.</span>
            </div>
          )}

          {/* Quick Adjustment Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quick Presets</label>
            <div className="grid grid-cols-5 gap-2">
              {[-5, -1, 1, 5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickDelta(val)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    Number(delta) === val
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 border-transparent text-white shadow-md'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Delta Manual Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Units (+/- integer)
            </label>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. +10 or -5"
              required
              className="w-full px-3.5 py-2 text-sm glass-input rounded-xl outline-none font-bold"
            />
          </div>

          {/* Note / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason or Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Weekly supplier restock, damaged return, cycle count"
              className="w-full px-3.5 py-2 text-sm glass-input rounded-xl outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isInvalid}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center space-x-1.5"
            >
              {loading ? 'Updating...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
