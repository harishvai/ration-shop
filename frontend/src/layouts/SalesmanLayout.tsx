import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Boxes,
  TrendingUp,
  Store,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  CheckCircle2
} from 'lucide-react';

interface SalesmanLayoutProps {
  currentTab: 'dashboard' | 'tokens' | 'stock' | 'sales' | 'profile';
  onNavigate: (tab: 'dashboard' | 'tokens' | 'stock' | 'sales' | 'profile') => void;
  children: React.ReactNode;
}

export const SalesmanLayout: React.FC<SalesmanLayoutProps> = ({ currentTab, onNavigate, children }) => {
  const { session, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0">
        {/* Shop Badge Header */}
        <div className="pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/50">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Shop Portal</span>
              <h2 className="text-base font-extrabold text-white tracking-tight">{session?.shop?.shopId || 'SHOP-101'}</h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 truncate">{session?.shop?.shopName || 'Fair Price Shop'}</p>
        </div>

        {/* Salesman Details Card */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">{session?.fullName || 'Salesman'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">ID: {session?.employeeId || 'EMP-101'}</p>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5 flex-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('tokens')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'tokens'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Today's Tokens</span>
          </button>

          <button
            onClick={() => onNavigate('stock')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'stock'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>My Shop Stock</span>
          </button>

          <button
            onClick={() => onNavigate('sales')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales & Distribution</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Shop Profile</span>
          </button>
        </nav>

        {/* Footer Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Salesman Portal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-white">{session?.shop?.shopId || 'SHOP-101'}</span>
            <span className="block text-[10px] text-emerald-400">Salesman Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 p-4 border-b border-slate-800 space-y-2">
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => { onNavigate('tokens'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'tokens' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Today's Tokens</span>
          </button>
          <button
            onClick={() => { onNavigate('stock'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'stock' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>My Shop Stock</span>
          </button>
          <button
            onClick={() => { onNavigate('sales'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'sales' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales & Distribution</span>
          </button>
          <button
            onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Shop Profile</span>
          </button>
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 p-2 text-xs text-red-400 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
