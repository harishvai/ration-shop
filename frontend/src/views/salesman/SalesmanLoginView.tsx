import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Store, ShieldCheck, AlertCircle, Loader2, Lock, User } from 'lucide-react';

interface SalesmanLoginViewProps {
  onBackToRoles: () => void;
  onSuccess: () => void;
}

export const SalesmanLoginView: React.FC<SalesmanLoginViewProps> = ({ onBackToRoles, onSuccess }) => {
  const [shopNumber, setShopNumber] = useState('SHOP-101');
  const [employeeId, setEmployeeId] = useState('EMP-101');
  const [password, setPassword] = useState('salesman123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNumber.trim() || !employeeId.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.loginSalesman({
        shopNumber,
        employeeId,
        password,
      });

      login({
        role: 'SALESMAN',
        token: response.token,
        employeeId: response.user.employeeId,
        fullName: response.user.fullName,
        designation: response.user.designation,
        shop: response.user.shop,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickCredentials = (shop: string, emp: string) => {
    setShopNumber(shop);
    setEmployeeId(emp);
    setPassword('salesman123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-800 text-white relative">
        <button
          onClick={onBackToRoles}
          className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center pt-4 mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Store className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Ration Shop Employee Access</span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Salesman Login
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Secure counter login for shop token verification, inventory deduction, and sales tracking.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Shop Number
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={shopNumber}
                onChange={(e) => setShopNumber(e.target.value)}
                placeholder="e.g. SHOP-101"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white font-mono text-sm tracking-wide uppercase transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Employee ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-101"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white font-mono text-sm tracking-wide uppercase transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Employee...</span>
              </>
            ) : (
              <span>Continue to Shop Dashboard</span>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuickCredentials('SHOP-101', 'EMP-101')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500 text-left transition-all"
            >
              <span className="block text-xs font-bold text-slate-200">Shop 101 (Central)</span>
              <span className="block text-[10px] font-mono text-emerald-400">EMP-101</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickCredentials('SHOP-104', 'EMP-104')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500 text-left transition-all"
            >
              <span className="block text-xs font-bold text-slate-200">Shop 104 (Low Stock)</span>
              <span className="block text-[10px] font-mono text-emerald-400">EMP-104</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Shop isolation enforced at API gateway</span>
        </div>
      </div>
    </div>
  );
};
