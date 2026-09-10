import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, CreditCard, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface PublicLoginViewProps {
  onBackToRoles: () => void;
  onSuccess: () => void;
}

export const PublicLoginView: React.FC<PublicLoginViewProps> = ({ onBackToRoles, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim()) {
      setError('Please enter a valid ration card number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.verifyPublicCard(cardNumber);
      login({
        role: 'PUBLIC',
        token: response.token,
        cardNumber: response.user.cardNumber,
        cardType: response.user.cardType,
        fullName: response.user.customerName,
        phone: response.user.phone,
        address: response.user.address,
        familyMembersCount: response.user.familyMembersCount,
        shop: response.user.shop,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to verify ration card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCard = (num: string) => {
    setCardNumber(num);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative">
        <button
          onClick={onBackToRoles}
          className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center pt-4 mb-8">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CreditCard className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Public Beneficiary Verification</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Enter your Ration Card Number
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Authenticate to check your monthly quota, order commodities, and track delivery tokens.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ration Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="e.g. RC-TN-2024-1001"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800 font-mono text-sm tracking-wider uppercase transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying with Database...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>

        {/* Quick Demo Cards Helper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Select Demo Cards
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickCard('RC-TN-2024-1001')}
              className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all"
            >
              <span className="block text-xs font-bold text-slate-800">Rajesh (Shop 101)</span>
              <span className="block text-[10px] font-mono text-blue-600">RC-TN-2024-1001</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickCard('RC-TN-2024-1002')}
              className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all"
            >
              <span className="block text-xs font-bold text-slate-800">Priya (Shop 101)</span>
              <span className="block text-[10px] font-mono text-blue-600">RC-TN-2024-1002</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Government PDS Server</span>
        </div>
      </div>
    </div>
  );
};
