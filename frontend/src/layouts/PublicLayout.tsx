import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Ticket,
  Clock,
  LogOut,
  Store,
  CreditCard,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

interface PublicLayoutProps {
  currentTab: 'ration' | 'cart' | 'my-token' | 'history';
  onNavigate: (tab: 'ration' | 'cart' | 'my-token' | 'history') => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ currentTab, onNavigate, children }) => {
  const { session, logout, cartTotalItemsCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/20 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">Smart Ration</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    Public
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Public Distribution Beneficiary Portal</p>
              </div>
            </div>

            {/* Shop & Beneficiary Info pill */}
            {session && (
              <div className="hidden md:flex items-center gap-3 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">{session.fullName || session.cardNumber}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono">
                    {session.cardType || 'PHH'}
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>{session.shop?.shopId || 'SHOP-101'}</span>
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('ration')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  currentTab === 'ration'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>My Ration</span>
              </button>

              <button
                onClick={() => onNavigate('cart')}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  currentTab === 'cart'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>My Cart</span>
                {cartTotalItemsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {cartTotalItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('my-token')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  currentTab === 'my-token'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>My Token</span>
              </button>

              <button
                onClick={() => onNavigate('history')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  currentTab === 'history'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>History</span>
              </button>

              <button
                onClick={logout}
                title="Log out"
                className="ml-2 p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 text-slate-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => { onNavigate('ration'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'ration' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>My Ration</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigate('cart'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'cart' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>My Cart ({cartTotalItemsCount})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigate('my-token'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'my-token' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>My Token</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigate('history'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'history' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Order History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">{session?.cardNumber}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-red-600 font-semibold px-2 py-1 rounded-md hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Smart Ration System — Certified Department of Food, Civil Supplies & Consumer Protection</span>
        </p>
      </footer>
    </div>
  );
};
