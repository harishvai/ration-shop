import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const SalesmanSalesView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'today' | 'weekly' | 'monthly'>('weekly');

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesmanSales();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve sales reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm font-medium">Computing sales & distribution ledger...</p>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
  const activeStats = timeframe === 'today' ? data?.today : timeframe === 'weekly' ? data?.weekly : data?.monthly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sales & Distribution</h1>
          <p className="text-xs text-slate-400">
            Performance indicators, distributed commodities volume, and subsidized revenue collections.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeframe === 'today' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeframe === 'weekly' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly (7 Days)
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeframe === 'monthly' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-sm text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Required Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">{activeStats?.totalOrders || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Booked in selected window</span>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivered Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-400 font-mono">{activeStats?.deliveredOrders || 0}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Physically dispensed</span>
          </div>
        </div>

        {/* Total Distributed Commodities */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Items Distributed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-purple-300 font-mono">
              {data?.itemDistribution?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0}{' '}
              <span className="text-xs font-normal">units</span>
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">Cumulative weight</span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Amount</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white font-mono">₹{(activeStats?.totalAmount || 0).toFixed(2)}</span>
            <span className="block text-[11px] text-slate-500 mt-1">Subsidized revenue collected</span>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Daily Revenue & Orders Trend (Last 7 Days)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Distribution Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Distributed Commodities Breakdown</span>
          </h3>
          <div className="space-y-3">
            {data?.itemDistribution?.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white text-sm">{item.name}</span>
                  <span className="block text-slate-500 font-mono">Revenue: ₹{item.revenue.toFixed(2)}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
