import React, { useState } from 'react';
import { Package, Lock, Mail, Building2, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function AuthPage({ onAuthSuccess, addToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    organization_name: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.auth.login({
          email: form.email,
          password: form.password,
        });
        addToast('Signed in successfully! Welcome back.', 'success');
        onAuthSuccess(res.data.user, res.data.access_token);
      } else {
        if (form.password !== form.confirm_password) {
          addToast('Passwords do not match', 'error');
          setLoading(false);
          return;
        }
        const res = await api.auth.signup({
          email: form.email,
          password: form.password,
          confirm_password: form.confirm_password,
          organization_name: form.organization_name,
        });
        addToast(`Organization '${res.data.user.organization_name}' created successfully!`, 'success');
        onAuthSuccess(res.data.user, res.data.access_token);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await api.auth.demoLogin();
      addToast('Logged in as Apex Retail Store (Demo Account)', 'success');
      onAuthSuccess(res.data.user, res.data.access_token);
    } catch (err) {
      addToast('Failed to log in with demo account', 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25 mb-4">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          StockFlow MVP
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Multi-Tenant SaaS Inventory Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200/80 sm:px-10">
          {/* 1-Click Demo Evaluation Box */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center text-xs font-semibold text-sky-900 uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 mr-1.5" />
                Recruiter / Tester 1-Click Demo
              </span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded-full font-medium">
                Pre-Seeded Data
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Explore live dashboard, low-stock warnings, and SKU management instantly without signing up manually.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-500/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <span>{demoLoading ? 'Launching Demo...' : '🚀 1-Click Demo Login (Apex Retail)'}</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with account</span>
            </div>
          </div>

          {/* Toggle Tab */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account (FR-1)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Store Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="organization_name"
                    required={!isLogin}
                    value={form.organization_name}
                    onChange={handleChange}
                    placeholder="e.g. My Test Store, Nexus Electronics"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  On signup, an isolated tenant Organization record is created (FR-2).
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="owner@yourstore.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    name="confirm_password"
                    required={!isLogin}
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Highlights Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Multi-tenant Isolation</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>FR-1 to FR-7 Built</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
