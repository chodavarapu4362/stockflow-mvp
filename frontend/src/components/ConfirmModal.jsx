import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmText = 'Delete', onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-6">{message}</p>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
