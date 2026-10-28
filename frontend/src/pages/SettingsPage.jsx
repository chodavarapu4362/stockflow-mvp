import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Building2, Save, RefreshCw, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function SettingsPage({ addToast, onOrgUpdated }) {
  const [settings, setSettings] = useState({
    name: '',
    default_low_stock_threshold: 5,
    user_email: '',
    created_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.settings.get();
      setSettings(res.data);
    } catch (err) {
      addToast('Failed to load organization settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.settings.update({
        name: settings.name,
        default_low_stock_threshold: parseInt(settings.default_low_stock_threshold, 10),
      });
      setSettings(res.data);
      if (onOrgUpdated) {
        onOrgUpdated(res.data.name);
      }
      addToast('Global settings updated! Dashboard threshold recalculated in real-time.', 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save settings';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-8 w-8 text-sky-400 animate-spin mr-2" />
        <span className="text-sm text-slate-300 font-semibold">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Organization Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure default inventory thresholds and organization profile (FR-7)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* FR-7: Global Default Low Stock Threshold */}
          <div className="p-5 rounded-2xl bg-sky-950/40 border border-sky-400/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">
                  Global Default Low Stock Threshold (FR-7)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  When a product does not have an item-specific threshold specified, this global default threshold is automatically applied to detect low-stock inventory across the dashboard.
                </p>
              </div>
            </div>

            <div className="pt-2 max-w-xs">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Threshold (Units) <span className="text-sky-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={settings.default_low_stock_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, default_low_stock_threshold: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm font-bold glass-input rounded-xl outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard baseline: 5 units. Items with stock ≤ this value trigger dashboard alerts.
              </span>
            </div>
          </div>

          {/* Organization Name */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization / Store Name
              </label>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl outline-none font-medium"
                />
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl glass-card border border-white/5">
                <span className="text-xs text-slate-400 font-medium block">Owner Email</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{settings.user_email}</span>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-white/5">
                <span className="text-xs text-slate-400 font-medium block">Multi-Tenant Scoping</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center mt-1">
                  <Shield className="h-3.5 w-3.5 mr-1" /> Strict Isolation Active (FR-2)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-white/10 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
