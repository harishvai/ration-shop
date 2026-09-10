import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StockItem, StockTransaction } from '../../types';
import { Modal } from '../../components/Modal';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  PlusCircle,
  RefreshCw,
  Loader2,
  Package,
  History,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const SalesmanStockView: React.FC = () => {
  const { session } = useAuth();
  const [items, setItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Restock modal state
  const [restockItem, setRestockItem] = useState<StockItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(100);
  const [shipmentRef, setShipmentRef] = useState<string>('');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesmanStock();
      setItems(res.items);
      setTransactions(res.recentTransactions);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve shop stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || restockQty <= 0) return;

    try {
      setSubmittingRestock(true);
      const res = await api.restockCommodity(
        restockItem.itemId,
        restockQty,
        shipmentRef || `WAYBILL-${Date.now().toString().slice(-6)}`
      );
      setSuccessMsg(`Successfully received ${restockQty} ${restockItem.unit} of ${restockItem.itemName}. Stock updated!`);
      setRestockItem(null);
      await fetchStock();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Restock failed');
    } finally {
      setSubmittingRestock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm font-medium">Loading inventory records for {session?.shop?.shopId}...</p>
      </div>
    );
  }

  const lowStockCount = items.filter(i => i.isLowStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">My Shop Stock</h1>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {session?.shop?.shopId || 'SHOP-101'} ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ledger computed via: <strong className="text-emerald-400">Current Stock = Opening + Received - Distributed</strong>.
          </p>
        </div>

        <button
          onClick={fetchStock}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-sm text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Low Stock Warning Header */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">Low Stock Alert: {lowStockCount} commodity below minimum safety buffer</span>
            <span>Immediate requisition recommended to avoid public rationing disruption.</span>
          </div>
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.itemId}
            className={`p-5 rounded-3xl bg-slate-950 border transition-all shadow-xl flex flex-col justify-between ${
              item.isLowStock
                ? 'border-red-500/60 ring-2 ring-red-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                {item.isLowStock ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                    LOW STOCK WARNING
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SUFFICIENT
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-white">{item.itemName}</h3>
              <p className="text-xs text-slate-500 font-mono">Code: {item.itemCode}</p>

              {/* Stock Formula Breakdown */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Opening Stock:</span>
                  <span className="font-mono font-medium text-slate-200">{item.openingStock} {item.unit}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>+ Received Stock:</span>
                  <span className="font-mono font-medium">+{item.receivedStock} {item.unit}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>- Distributed Stock:</span>
                  <span className="font-mono font-medium">-{item.distributedStock} {item.unit}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-slate-300">= Current Stock:</span>
                  <span className={`font-mono text-base ${item.isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Min Buffer Threshold:</span>
                <span className="font-mono text-slate-400 font-semibold">{item.minThreshold} {item.unit}</span>
              </div>
            </div>

            {/* Restock Trigger Button */}
            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setRestockItem(item);
                  setRestockQty(100);
                  setShipmentRef(`GOV-WH-IN-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Receive Warehouse Shipment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Stock Transactions Log Table */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          <History className="w-4 h-4 text-purple-400" />
          <span>Audit Ledger: Recent Shop Stock Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-500 uppercase font-mono border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2 px-3">Date/Time</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Commodity</th>
                <th className="py-2 px-3">Quantity</th>
                <th className="py-2 px-3">Balance After</th>
                <th className="py-2 px-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === 'DISPATCH_DELIVERY'
                          ? 'bg-amber-500/20 text-amber-300'
                          : tx.type === 'RESTOCK_RECEIVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{tx.itemName}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {tx.type === 'DISPATCH_DELIVERY' ? `-${tx.quantity}` : `+${tx.quantity}`} {tx.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{tx.balanceAfter} {tx.unit}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{tx.reference || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK COMMODITY MODAL */}
      {restockItem && (
        <Modal
          isOpen={!!restockItem}
          onClose={() => setRestockItem(null)}
          title={`Restock: ${restockItem.itemName}`}
          icon={<PlusCircle className="w-5 h-5 text-emerald-500" />}
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4 text-slate-800 text-sm">
            <div className="p-3 rounded-xl bg-slate-100 text-xs">
              <div className="flex justify-between">
                <span>Shop:</span>
                <span className="font-bold">{session?.shop?.shopId}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Current Stock:</span>
                <span className="font-bold">{restockItem.currentStock} {restockItem.unit}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Received Quantity ({restockItem.unit})
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={restockQty}
                onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Warehouse Shipment / Waybill Reference
              </label>
              <input
                type="text"
                value={shipmentRef}
                onChange={(e) => setShipmentRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRestock}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submittingRestock ? 'Updating Stock...' : 'Confirm Restock'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
