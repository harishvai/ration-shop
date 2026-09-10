import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Modal } from '../../components/Modal';
import {
  Ticket,
  Search,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Package,
  AlertCircle,
  Loader2,
  Store,
  Calendar,
  ShieldCheck,
  Check
} from 'lucide-react';

export const SalesmanTokensView: React.FC = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Selected Token for Details Modal
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  // Confirmation Dialog for Delivery
  const [confirmDeliveryToken, setConfirmDeliveryToken] = useState<any | null>(null);
  const [deliveryRemarks, setDeliveryRemarks] = useState('Biometric authentication & token verified by salesman at counter');
  const [delivering, setDelivering] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesmanTokens({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: search.trim() || undefined,
      });
      setTokens(res.tokens);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve shop tokens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTokens();
  };

  const handleConfirmDelivery = async () => {
    if (!confirmDeliveryToken) return;

    try {
      setDelivering(true);
      setError(null);

      const res = await api.markDelivered(confirmDeliveryToken.tokenId, deliveryRemarks);
      setSuccessMsg(`Token ${confirmDeliveryToken.tokenNumber} marked as DELIVERED! Inventory deducted and audit logged.`);

      // Close modals
      setConfirmDeliveryToken(null);
      setSelectedToken(null);

      // Refresh token list
      await fetchTokens();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to deliver order');
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Today's Tokens</h1>
          <p className="text-xs text-slate-400">
            Verify customer ration tokens, inspect reserved items, and execute authorized deliveries.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative min-w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token, customer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </form>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="ALL">All Tokens</option>
            <option value="READY">Ready (Pending Delivery)</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-sm text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-sm text-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tokens Table Matching Section 7 */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Token Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Loading tokens...</span>
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No tokens found for this search filter.
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => {
                  const isDelivered = tok.tokenStatus === 'DELIVERED';

                  return (
                    <tr key={tok.tokenId} className="hover:bg-slate-900/50 transition-colors">
                      {/* Token Number */}
                      <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-emerald-400" />
                          <span>{tok.tokenNumber}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-200">{tok.customerName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{tok.cardNumber}</div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 max-w-xs truncate font-medium text-slate-300">
                        {tok.itemsSummary || 'Standard Ration'}
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {tok.paymentStatus || 'PAID'} • ₹{tok.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>DELIVERED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>READY</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedToken(tok)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                        >
                          View Token
                        </button>

                        {!isDelivered && (
                          <button
                            onClick={() => setConfirmDeliveryToken(tok)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-600/30"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW TOKEN MODAL */}
      {selectedToken && (
        <Modal
          isOpen={!!selectedToken}
          onClose={() => setSelectedToken(null)}
          title={`Verify Token: ${selectedToken.tokenNumber}`}
          icon={<Ticket className="w-5 h-5 text-emerald-400" />}
        >
          <div className="space-y-4 text-slate-800 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-emerald-400 font-mono font-bold text-base">
                  {selectedToken.tokenNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedToken.tokenStatus === 'DELIVERED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {selectedToken.tokenStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Beneficiary:</span>
                  <p className="font-bold text-white">{selectedToken.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Card Number:</span>
                  <p className="font-mono text-white">{selectedToken.cardNumber} ({selectedToken.cardType})</p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Commodities in this Token:
              </span>
              <div className="space-y-2">
                {selectedToken.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">{it.itemName}</span>
                      <span className="block text-[11px] text-slate-500">Rate: ₹{it.unitPrice} / {it.unit}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {it.quantity} {it.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-600">Total Subsidized Amount:</span>
              <span className="font-black text-slate-900 text-base font-mono">
                ₹{selectedToken.totalAmount.toFixed(2)}
              </span>
            </div>

            {selectedToken.tokenStatus !== 'DELIVERED' ? (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setConfirmDeliveryToken(selectedToken);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Proceed to Mark as Delivered
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Delivered at: {new Date(selectedToken.deliveredAt).toLocaleString()} by {selectedToken.deliveredBy}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* CONFIRM DELIVERY MODAL (Matches Section 8 of Prompt) */}
      {confirmDeliveryToken && (
        <Modal
          isOpen={!!confirmDeliveryToken}
          onClose={() => setConfirmDeliveryToken(null)}
          title="Confirm Commodity Handover"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
        >
          <div className="space-y-4 text-slate-800 text-sm">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
              <h4 className="font-bold text-base mb-1">
                Are you sure you want to mark this order as delivered?
              </h4>
              <p className="text-xs text-amber-800">
                Confirming delivery will permanently mark token <strong>{confirmDeliveryToken.tokenNumber}</strong> as DELIVERED, automatically deduct stock from shop inventory, and generate a stock dispatch transaction audit record.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{confirmDeliveryToken.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Items:</span>
                <span className="font-semibold text-slate-800">{confirmDeliveryToken.itemsSummary}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Verification Remarks
              </label>
              <input
                type="text"
                value={deliveryRemarks}
                onChange={(e) => setDeliveryRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeliveryToken(null)}
                disabled={delivering}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelivery}
                disabled={delivering}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {delivering ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deducting Stock & Logging...</span>
                  </>
                ) : (
                  <span>Confirm Delivery</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
