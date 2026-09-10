import React from 'react';
import { User, Store, Building2, ArrowRight, ShieldCheck, Sparkles, Key } from 'lucide-react';

interface WelcomeViewProps {
  onSelectRole: (role: 'PUBLIC' | 'SALESMAN' | 'HEAD') => void;
  onOpenDemoCredentials: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectRole, onOpenDemoCredentials }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
            🌾
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Smart Ration</h1>
            <p className="text-xs text-emerald-400 font-medium tracking-wide">Public Distribution System (PDS)</p>
          </div>
        </div>

        <button
          onClick={onOpenDemoCredentials}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-all shadow-sm"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Credentials</span>
        </button>
      </header>

      {/* Hero Content */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 sm:py-12 z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Civil Supplies Portal</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Smart Ration
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-medium">
            Digital Ration Shop Management System
          </p>
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Who are you?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your identity to access your dedicated management portal
            </p>
          </div>
        </div>

        {/* THREE Role-Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. PUBLIC CARD */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-blue-500/30 hover:border-blue-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/20 backdrop-blur-xl">
            <div className="absolute top-4 right-4 text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CITIZEN
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Ration Card Holder</h4>
                <h3 className="text-2xl font-black text-white tracking-tight">PUBLIC</h3>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Check your ration entitlement, select items, make payment and track your token.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => onSelectRole('PUBLIC')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50"
              >
                <span>Continue as Public</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. SALESMAN CARD */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/20 backdrop-blur-xl">
            <div className="absolute top-4 right-4 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              OPERATOR
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ration Shop Employee</h4>
                <h3 className="text-2xl font-black text-white tracking-tight">SALESMAN</h3>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Manage your shop's orders, tokens, stock and deliveries.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => onSelectRole('SALESMAN')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-600/50"
              >
                <span>Continue as Salesman</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 3. HEAD CARD */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-purple-500/30 hover:border-purple-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-xl">
            <div className="absolute top-4 right-4 text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              DIRECTORATE
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Head of Department</h4>
                <h3 className="text-2xl font-black text-white tracking-tight">HEAD</h3>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Monitor all ration shops, sales, stock and overall performance.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => onSelectRole('HEAD')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 group-hover:shadow-purple-600/50"
              >
                <span>Continue as Head</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Authenticated Role-Based Access Control (RBAC) Enforced</span>
        </div>
        <div>
          <span>Database: PostgreSQL Engine Online</span>
        </div>
      </footer>
    </div>
  );
};
