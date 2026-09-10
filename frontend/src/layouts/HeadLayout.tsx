import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Building2,
  Search,
  BarChart3,
  Boxes,
  TrendingUp,
  FileText,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface HeadLayoutProps {
  currentTab: 'dashboard' | 'shops' | 'search' | 'analytics' | 'reports';
  onNavigate: (tab: 'dashboard' | 'shops' | 'search' | 'analytics' | 'reports') => void;
  children: React.ReactNode;
}

export const HeadLayout: React.FC<HeadLayoutProps> = ({ currentTab, onNavigate, children }) => {
  const { session, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-4 shrink-0 shadow-xl">
        {/* Department Seal Header */}
        <div className="pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-wider text-purple-400 uppercase">State Directorate</span>
              <h2 className="text-base font-extrabold tracking-tight text-white">Head Office</h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Civil Supplies & Consumer Affairs</p>
        </div>

        {/* Head Administrator Profile Badge */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-100">Supervisory Access</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-300 font-mono">Officer ID: {session?.headId || 'HEAD-001'}</p>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5 flex-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>HQ Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('shops')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'shops'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>All Ration Shops</span>
          </button>

          <button
            onClick={() => onNavigate('search')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'search'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Shop (Drill-Down)</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>State Analytics</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'reports'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit & Reports</span>
          </button>
        </nav>

        {/* Footer Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Directorate Portal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-white">State Directorate HQ</span>
            <span className="block text-[10px] text-purple-300">Head of Department</span>
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
        <div className="md:hidden bg-slate-900 p-4 border-b border-slate-800 space-y-2 text-white">
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>HQ Dashboard</span>
          </button>
          <button
            onClick={() => { onNavigate('shops'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'shops' ? 'bg-purple-600 text-white' : 'text-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>All Ration Shops</span>
          </button>
          <button
            onClick={() => { onNavigate('search'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'search' ? 'bg-purple-600 text-white' : 'text-slate-300'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Shop (Drill-Down)</span>
          </button>
          <button
            onClick={() => { onNavigate('analytics'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>State Analytics</span>
          </button>
          <button
            onClick={() => { onNavigate('reports'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              currentTab === 'reports' ? 'bg-purple-600 text-white' : 'text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit & Reports</span>
          </button>
          <div className="pt-2 border-t border-slate-800">
            <button onClick={logout} className="w-full flex items-center gap-2 p-2 text-xs text-red-400 font-semibold">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
