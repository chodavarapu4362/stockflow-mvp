import React, { useState } from 'react';
import { Package, Lock, Mail, Building2, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Box } from 'lucide-react';
import { api } from '../api';
import TiltCard from '../components/TiltCard';

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
    <div className="min-h-screen relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header with 3D Isometric Floating Icon */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block relative mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 rounded-3xl blur-md opacity-75 animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl bg-slate-900 border border-white/20 flex items-center justify-center text-sky-400 shadow-2xl animate-float-3d mx-auto">
            <Box className="h-9 w-9 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
          StockFlow <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">MVP 3D</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Next-Gen SaaS Multi-Tenant Inventory Architecture
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <TiltCard maxTilt={5} scale={1.01} className="rounded-3xl">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* 1-Click Demo Evaluation Box with 3D Holographic Glow */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-indigo-950/60 to-purple-950/60 border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center text-xs font-bold text-sky-300 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 mr-1.5 animate-spin" />
                  Wexa Recruiter / Evaluator
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/40 px-2 py-0.5 rounded-full font-bold">
                  Pre-Seeded 3D
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
                Experience real-time threshold recalculations, multi-tenant scoping, and stock delta controls in 1 click.
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading || loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/30 transition-all transform active:scale-95 disabled:opacity-50"
              >
                <span>{demoLoading ? 'Initializing 3D Workspace...' : '🚀 1-Click Demo Login (Apex Retail)'}</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900/90 px-3 text-slate-400 font-medium rounded-full border border-white/5">
                  Or authenticate account
                </span>
              </div>
            </div>

            {/* Toggle Tab */}
            <div className="flex rounded-xl bg-slate-900/80 border border-white/10 p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Tenant (FR-1)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization / Store Name <span className="text-sky-400">*</span>
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
                      placeholder="e.g. Nexus Electronics Store"
                      className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Creates an isolated Organization record & scopes all inventory (FR-2).
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-sky-400">*</span>
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
                    className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-sky-400">*</span>
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
                    className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl outline-none"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-sky-400">*</span>
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
                      className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-sky-600/30"
              >
                <span>{loading ? 'Authenticating...' : isLogin ? 'Launch 3D Dashboard' : 'Complete Tenant Setup'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Highlights Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Multi-Tenant Scoping</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>FastAPI + SQLite/Postgres</span>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
