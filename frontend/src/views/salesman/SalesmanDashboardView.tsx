import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShoppingBag,
  Ticket,
  CheckCircle2,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Store,
  RefreshCw,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';

interface SalesmanDashboardViewProps {
  onNavigate: (tab: 'tokens' | 'stock' | 'sales') => void;
}

export const SalesmanDashboardView: React.FC<SalesmanDashboardViewProps> = ({ onNavigate }) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesmanDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load salesman metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm font-medium">Loading {session?.shop?.shopId || 'Shop'} dashboard data...</p>
      </div>
    );
  }

  const stats = data?.stats;
  const shop = data?.shop;

  return (
    <div className="space-y-6">
      {/* Top Banner / Shop Identification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider">
                Authorized Shop
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {shop?.shop_id || session?.shop?.shopId || 'SHOP-101'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {shop?.shop_name || session?.shop?.shopName} • {shop?.location}
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboard}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Counters</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Low Stock Warning Banner if any item below threshold */}
      {stats?.lowStockItemsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-200">Low Stock Alert Detected</h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {stats.lowStockItemsCount} {stats.lowStockItemsCount === 1 ? 'commodity is' : 'commodities are'} below minimum safety threshold. Check inventory and request restock.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* The 5 Main Dashboard Metric Cards Required by Prompt:
          - Today's Orders
          - Pending Tokens
          - Delivered Orders
          - Current Stock
          - Today's Sales
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Today's Orders */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">{stats?.todayOrders || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Total placed today</span>
          </div>
        </div>

        {/* 2. Pending Tokens */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Tokens</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-400 font-mono">{stats?.pendingTokens || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Awaiting physical delivery</span>
          </div>
        </div>

        {/* 3. Delivered Orders */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivered Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-400 font-mono">{stats?.deliveredOrdersToday || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Delivered today</span>
          </div>
        </div>

        {/* 4. Current Stock */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Stock</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-purple-300 font-mono">
              {(stats?.totalStockKg || 0).toLocaleString()} <span className="text-xs font-normal">kg</span>
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">All commodities in shop</span>
          </div>
        </div>

        {/* 5. Today's Sales */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Today's Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">₹{(stats?.todaySales || 0).toFixed(2)}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Revenue collected</span>
          </div>
        </div>
      </div>

      {/* Quick Action Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Token Management Fast Link */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-emerald-500/50 transition-all group">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Ticket className="w-4 h-4" />
              <span>Counter Operations</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Verify & Deliver Tokens</h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify customer ration token, review reserved commodities, and execute delivery handover.
            </p>
          </div>
          <button
            onClick={() => onNavigate('tokens')}
            className="p-3.5 rounded-2xl bg-emerald-600 group-hover:bg-emerald-500 text-white transition-all shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Management Fast Link */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-purple-500/50 transition-all group">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Boxes className="w-4 h-4" />
              <span>Inventory Management</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">My Shop Stock & Inflow</h3>
            <p className="text-xs text-slate-400 mt-1">
              Track Rice, Wheat, Sugar, Dal opening, received, distributed and current balances.
            </p>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="p-3.5 rounded-2xl bg-purple-600 group-hover:bg-purple-500 text-white transition-all shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
