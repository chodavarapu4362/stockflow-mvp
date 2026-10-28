import React from 'react';
import { LayoutDashboard, Package, Settings, LogOut, Building2, User, Sparkles } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-950/75 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand with 3D Depth */}
          <div className="flex items-center space-x-8">
            <div 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 opacity-70 blur-xs group-hover:opacity-100 transition duration-300" />
                <div className="relative h-10 w-10 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center text-sky-400 shadow-xl group-hover:scale-105 transition-transform">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                    StockFlow
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/10 border border-sky-400/30 text-sky-300 rounded-full tracking-wide">
                    MVP 3D
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Org & User Profile Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Organization Context Badge (FR-2) */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10 text-xs shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200 max-w-[140px] truncate">
                {user?.organization_name || 'My Organization'}
              </span>
            </div>

            {/* User Email */}
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="hidden lg:inline-block max-w-[160px] truncate font-medium text-slate-300">
                {user?.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-t border-white/10 px-4 py-2 flex justify-around bg-slate-950/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-1 text-xs font-medium ${
                isActive ? 'text-sky-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
