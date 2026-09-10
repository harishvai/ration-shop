import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ShopSummary } from '../../types';
import {
  Building2,
  Store,
  User,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Search,
  ArrowRight,
  Loader2,
  RefreshCw,
  Phone
} from 'lucide-react';

interface HeadShopsViewProps {
  onDrillDown: (shopId: string) => void;
}

export const HeadShopsView: React.FC<HeadShopsViewProps> = ({ onDrillDown }) => {
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.getAllShops();
      setShops(res.shops);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load shops directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredShops = shops.filter(
    s =>
      s.shopId.toLowerCase().includes(filterText.toLowerCase()) ||
      s.shopName.toLowerCase().includes(filterText.toLowerCase()) ||
      s.location.toLowerCase().includes(filterText.toLowerCase()) ||
      s.salesman?.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">All Ration Shops</h1>
          <p className="text-xs text-slate-500">
            Comprehensive oversight directory of all 5 Fair Price Shops operating in the municipal district.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by shop ID, name, location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-purple-600 shadow-2xs"
            />
          </div>

          <button
            onClick={fetchShops}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Table Matching Section 12 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Shop Number</th>
                <th className="py-3.5 px-4">Shop Name & Location</th>
                <th className="py-3.5 px-4">Salesman</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Today's Sales</th>
                <th className="py-3.5 px-4">Monthly Sales</th>
                <th className="py-3.5 px-4">Pending Orders</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading directory...</span>
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No matching ration shops found.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.shopId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Shop Number */}
                    <td className="py-4 px-4 font-mono font-black text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{shop.shopId}</span>
                      </div>
                    </td>

                    {/* Shop Name & Location */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{shop.shopName}</p>
                      <p className="text-[11px] text-slate-500">{shop.location}, {shop.district} - {shop.pincode}</p>
                    </td>

                    {/* Salesman */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{shop.salesman?.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {shop.salesman?.employeeId}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {shop.currentStockKg.toLocaleString()} kg
                        </span>
                        {shop.hasLowStock && (
                          <span
                            title="Low Stock Warning on one or more commodities"
                            className="p-1 rounded-full bg-red-100 text-red-600"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Today's Sales */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      ₹{shop.todaySales.toFixed(2)}
                    </td>

                    {/* Monthly Sales */}
                    <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                      ₹{shop.monthlySales.toFixed(2)}
                    </td>

                    {/* Pending Orders */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                        shop.pendingOrders > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {shop.pendingOrders}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {shop.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onDrillDown(shop.shopId)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 ml-auto transition-colors"
                      >
                        <span>Drill-Down</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
