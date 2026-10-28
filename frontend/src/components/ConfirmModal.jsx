import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmText = 'Delete', onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-sm w-full shadow-2xl border border-white/15 overflow-hidden animate-scale-up">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Action cannot be reversed</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">{message}</p>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/30 transition-all"
            >
              {loading ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
