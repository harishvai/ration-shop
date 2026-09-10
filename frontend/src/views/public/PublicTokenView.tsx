import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { TokenRecord } from '../../types';
import {
  Ticket,
  Store,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Package,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck
} from 'lucide-react';

export const PublicTokenView: React.FC = () => {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await api.getMyTokens();
      setTokens(res.tokens);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve your token records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // Poll every 10 seconds for real-time status change to DELIVERED
    const interval = setInterval(() => {
      fetchTokens(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-medium">Loading your token status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Token</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {tokens.length} {tokens.length === 1 ? 'Token' : 'Tokens'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Present your active digital token at the Fair Price Shop counter for biometric verification and commodity delivery.
          </p>
        </div>

        <button
          onClick={() => fetchTokens(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Checking Status...' : 'Refresh Status'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xs">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Tokens Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            You don't have any active or past ration tokens. Go to "My Ration" to order items.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tokens.map((tok) => {
            const isDelivered = tok.tokenStatus === 'DELIVERED' || tok.orderStatus === 'DELIVERED';

            return (
              <div
                key={tok.tokenId}
                className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs ${
                  isDelivered
                    ? 'border-emerald-200 shadow-emerald-500/5'
                    : 'border-amber-300 ring-2 ring-amber-400/20'
                }`}
              >
                {/* Header Bar */}
                <div
                  className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
                    isDelivered
                      ? 'bg-emerald-50/70 border-emerald-100'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isDelivered ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Token Number
                      </span>
                      <h2 className="text-xl font-black font-mono tracking-tight text-slate-900">
                        {tok.tokenNumber}
                      </h2>
                    </div>
                  </div>

                  {/* Order Status Badge */}
                  <div>
                    {isDelivered ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>🟢 DELIVERED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm shadow-amber-500/30 animate-pulse">
                        <Clock className="w-4 h-4" />
                        <span>🟡 READY FOR COLLECTION</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Shop Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Store className="w-4 h-4 text-blue-600" />
                      <span>Ration Shop</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <p className="font-extrabold text-slate-900 font-mono text-sm">{tok.shopId}</p>
                      <p className="text-slate-700 font-medium mt-0.5">{tok.shopName}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{tok.shopLocation}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Payment Status</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-bold text-emerald-700">{tok.paymentStatus || 'COMPLETED'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Method:</span>
                        <span className="font-semibold text-slate-800">{tok.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount:</span>
                        <span className="font-extrabold text-slate-900 text-sm">₹{tok.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Timeline Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Delivery Details</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Generated:</span>
                        <span className="font-medium text-slate-700">
                          {new Date(tok.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {isDelivered && tok.deliveredAt ? (
                        <>
                          <div className="flex justify-between text-emerald-700 font-medium">
                            <span>Delivered At:</span>
                            <span>{new Date(tok.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {tok.deliveredBy && (
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>Delivered By:</span>
                              <span className="font-mono">{tok.deliveredBy}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-amber-700 text-[11px] font-medium pt-1">
                          Awaiting salesman handover at shop counter
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                    Allocated Items Under This Token
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tok.items?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="font-black text-emerald-700 text-sm font-mono mt-1">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
