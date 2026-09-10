import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Search,
  Store,
  User,
  Boxes,
  TrendingUp,
  AlertTriangle,
  History,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Phone,
  MapPin,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface HeadSearchViewProps {
  initialShopId?: string;
}

export const HeadSearchView: React.FC<HeadSearchViewProps> = ({ initialShopId }) => {
  const [shopQuery, setShopQuery] = useState(initialShopId || 'SHOP-101');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (targetId: string) => {
    if (!targetId.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.searchShop(targetId.trim().toUpperCase());
      setData(res);
    } catch (err: any) {
      setError(err.message || `Ration shop '${targetId}' not found.`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialShopId) {
      setShopQuery(initialShopId);
      performSearch(initialShopId);
    } else {
      performSearch('SHOP-101');
    }
  }, [initialShopId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(shopQuery);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search by Shop Number</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicated supervisory drill-down. Audit any registered shop's inventory, staff, orders, and sales ledger.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={shopQuery}
              onChange={(e) => setShopQuery(e.target.value)}
              placeholder="Enter Shop Number, e.g. SHOP-101, SHOP-102, SHOP-104..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 font-mono text-sm uppercase tracking-wider font-bold transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Shop Record</span>
          </button>
        </form>

        {/* Quick Shop Selectors */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Select:</span>
          {['SHOP-101', 'SHOP-102', 'SHOP-103', 'SHOP-104', 'SHOP-105'].map((sId) => (
            <button
              key={sId}
              type="button"
              onClick={() => {
                setShopQuery(sId);
                performSearch(sId);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                shopQuery === sId
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {sId}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comprehensive Drill-Down Content */}
      {data && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Shop & Salesman Overview Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {data.shopDetails.shop_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {data.shopDetails.status}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{data.shopDetails.shop_name}</h2>
              <p className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{data.shopDetails.location}, {data.shopDetails.district} - {data.shopDetails.pincode}</span>
              </p>
              {data.shopDetails.contact_phone && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{data.shopDetails.contact_phone}</span>
                </p>
              )}
            </div>

            {/* Salesman Details */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-2">
                Assigned Shop Salesman & Operators
              </span>
              {data.salesmen && data.salesmen.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {data.salesmen.map((sm: any) => (
                    <div key={sm.employee_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{sm.full_name}</p>
                        <p className="text-slate-400">{sm.designation}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-purple-300 font-bold">{sm.employee_id}</span>
                        <span className="block text-[11px] text-slate-400">{sm.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No active salesmen assigned.</p>
              )}
            </div>
          </div>

          {/* 2. Sales Figures Cards (Today, Weekly, Monthly, Delivered vs Pending) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Today's Sales</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                ₹{data.salesMetrics.todaySales.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-500">{data.salesMetrics.todayOrders} orders today</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Sales (7D)</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                ₹{data.salesMetrics.weeklySales.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-500">{data.salesMetrics.weeklyOrders} orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Monthly Sales</span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                ₹{data.salesMetrics.monthlySales.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-500">{data.salesMetrics.monthlyOrders} orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fulfillment Ratio</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-emerald-600">
                  {data.salesMetrics.deliveredOrders} Delivered
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-amber-600">
                  {data.salesMetrics.pendingOrders} Pending
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Total {data.salesMetrics.totalOrders} recorded</span>
            </div>
          </div>

          {/* 3. Current Stock Breakdown Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-600" />
              <span>Current Stock Breakdown ({data.shopDetails.shop_id})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase font-mono font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Commodity</th>
                    <th className="py-2.5 px-3">Opening Stock</th>
                    <th className="py-2.5 px-3">Received</th>
                    <th className="py-2.5 px-3">Distributed</th>
                    <th className="py-2.5 px-3">Current Stock</th>
                    <th className="py-2.5 px-3">Min Threshold</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.currentStock?.map((st: any) => (
                    <tr key={st.itemId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-900">{st.itemName}</td>
                      <td className="py-3 px-3 font-mono">{st.openingStock} {st.unit}</td>
                      <td className="py-3 px-3 font-mono text-emerald-600">+{st.receivedStock} {st.unit}</td>
                      <td className="py-3 px-3 font-mono text-amber-600">-{st.distributedStock} {st.unit}</td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                        {st.currentStock} {st.unit}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{st.minThreshold} {st.unit}</td>
                      <td className="py-3 px-3">
                        {st.isLowStock ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Stock History & Item Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stock History Audit Ledger */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Recent Stock Ledger History</span>
              </h3>
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-400">
                    <tr>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Item</th>
                      <th className="py-2 px-2">Qty</th>
                      <th className="py-2 px-2">Balance</th>
                      <th className="py-2 px-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.stockHistory?.map((h: any) => (
                      <tr key={h.id}>
                        <td className="py-2 px-2 text-slate-400 text-[11px]">{new Date(h.timestamp).toLocaleDateString()}</td>
                        <td className="py-2 px-2 font-semibold">{h.type}</td>
                        <td className="py-2 px-2 font-bold text-slate-800">{h.itemName}</td>
                        <td className="py-2 px-2 font-mono font-bold">
                          {h.type === 'DISPATCH_DELIVERY' ? `-${h.quantity}` : `+${h.quantity}`}
                        </td>
                        <td className="py-2 px-2 font-mono text-slate-900">{h.balanceAfter}</td>
                        <td className="py-2 px-2 font-mono text-slate-400 text-[10px]">{h.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Item Distribution Totals */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Total Items Distributed</span>
              </h3>
              <div className="space-y-3">
                {data.itemDistribution?.length === 0 ? (
                  <p className="text-xs text-slate-400">No completed distribution records yet.</p>
                ) : (
                  data.itemDistribution?.map((it: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 text-sm">{it.name}</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {it.quantity} {it.unit}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
