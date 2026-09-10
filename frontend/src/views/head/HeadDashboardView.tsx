import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Building2,
  Users,
  ShoppingBag,
  TrendingUp,
  Boxes,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  RefreshCw,
  Shield
} from 'lucide-react';

interface HeadDashboardViewProps {
  onNavigate: (tab: 'shops' | 'search' | 'analytics' | 'reports') => void;
  onSelectShopForSearch: (shopId: string) => void;
}

export const HeadDashboardView: React.FC<HeadDashboardViewProps> = ({
  onNavigate,
  onSelectShopForSearch
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.getHeadDashboard();
      setMetrics(res.metrics);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve head of department metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
        <p className="text-sm font-medium">Aggregating state-wide ration shop analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Directorate Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-purple-300 flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
              Department of Civil Supplies & Consumer Protection
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Head of Department Dashboard
            </h1>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Live state monitoring covering all 5 Fair Price Shops, public entitlements, and supply integrity.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-purple-100 border border-white/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
          <span>Refresh Directorate Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* The 8 Required Dashboard Cards from Section 11 of User Prompt:
          - Total Shops
          - Total Customers
          - Today's Orders
          - Today's Sales
          - Total Stock
          - Low Stock Shops
          - Pending Orders
          - Delivered Orders
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Shops */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Shops</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 font-mono">{metrics?.totalShops || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Active Fair Price Shops</span>
          </div>
        </div>

        {/* 2. Total Customers */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 font-mono">{metrics?.totalCustomers || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Enrolled Beneficiaries</span>
          </div>
        </div>

        {/* 3. Today's Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 font-mono">{metrics?.todayOrders || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Booked across all shops</span>
          </div>
        </div>

        {/* 4. Today's Sales */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-700 font-mono">₹{(metrics?.todaySales || 0).toFixed(2)}</span>
            <span className="block text-[11px] text-slate-500 mt-1">State collections today</span>
          </div>
        </div>

        {/* 5. Total Stock */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stock</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {(metrics?.totalStockKg || 0).toLocaleString()} <span className="text-xs font-normal">kg</span>
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">Grain & oil in all shops</span>
          </div>
        </div>

        {/* 6. Low Stock Shops */}
        <div className={`p-5 rounded-3xl border shadow-xs ${
          metrics?.lowStockShopsCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Low Stock Shops</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-red-600 font-mono">{metrics?.lowStockShopsCount || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Require warehouse replenishment</span>
          </div>
        </div>

        {/* 7. Pending Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-600 font-mono">{metrics?.pendingOrders || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Queue awaiting pickup</span>
          </div>
        </div>

        {/* 8. Delivered Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivered Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-700 font-mono">{metrics?.deliveredOrders || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Fulfilled transactions</span>
          </div>
        </div>
      </div>

      {/* Navigation Quick Cards for Head */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div
          onClick={() => onNavigate('shops')}
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">All Ration Shops Directory</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Inspect all 5 ration shops (SHOP-101 to SHOP-105), salesmen assigned, live stock, and pending orders.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
            <span>Open All Shops</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('search')}
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Search Shop by Number</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Deep-drill into any specific shop (e.g. SHOP-101) to audit salesman details, stock history, and sales.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
            <span>Shop Drill-Down Search</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('analytics')}
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Comparative Analytics</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Compare shop sales, commodity stock levels, and daily timeline trends with interactive charts.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
            <span>View Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
