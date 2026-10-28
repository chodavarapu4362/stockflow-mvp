import React from 'react';
import { LayoutDashboard, Package, Settings, LogOut, Building2, User } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <div 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  StockFlow
                </span>
                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-800 rounded-full tracking-wide">
                  MVP v0.1
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Org & User Profile Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Organization Badge (Tenant Context) */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-900 max-w-[140px] truncate">
                {user?.organization_name || 'My Organization'}
              </span>
            </div>

            {/* User Email */}
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="hidden lg:inline-block max-w-[160px] truncate font-medium text-slate-700">
                {user?.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-t border-slate-100 px-4 py-2 flex justify-around bg-slate-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-1 text-xs font-medium ${
                isActive ? 'text-sky-600' : 'text-slate-500'
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
