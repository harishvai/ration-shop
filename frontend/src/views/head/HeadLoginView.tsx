import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Shield, AlertCircle, Loader2, Lock, Key } from 'lucide-react';

interface HeadLoginViewProps {
  onBackToRoles: () => void;
  onSuccess: () => void;
}

export const HeadLoginView: React.FC<HeadLoginViewProps> = ({ onBackToRoles, onSuccess }) => {
  const [headId, setHeadId] = useState('HEAD-001');
  const [password, setPassword] = useState('head123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headId.trim() || !password.trim()) {
      setError('Please enter Head ID and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.loginHead({ headId, password });
      login({
        role: 'HEAD',
        token: response.token,
        headId: response.user.headId,
        fullName: response.user.fullName,
        department: response.user.department,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-purple-100 text-slate-800 relative">
        <button
          onClick={onBackToRoles}
          className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center pt-4 mb-8">
          <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Shield className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Civil Supplies Directorate</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Head of Department Login
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Supervisory administrative clearance for state-wide monitoring, shop auditing, and distribution analytics.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Head ID
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={headId}
                onChange={(e) => setHeadId(e.target.value)}
                placeholder="e.g. HEAD-001"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-slate-900 font-mono text-sm tracking-wide uppercase transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-slate-900 text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Officer...</span>
              </>
            ) : (
              <span>Continue as Head of Department</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Demo Account:</span>
          <button
            type="button"
            onClick={() => { setHeadId('HEAD-001'); setPassword('head123'); }}
            className="font-mono text-purple-700 font-bold hover:underline"
          >
            HEAD-001 / head123
          </button>
        </div>
      </div>
    </div>
  );
};
