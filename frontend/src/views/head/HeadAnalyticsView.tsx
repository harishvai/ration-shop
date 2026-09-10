import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  SlidersHorizontal,
  TrendingUp,
  Boxes,
  Layers,
  PieChart as PieIcon,
  Calendar,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const HeadAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRange, setFilterRange] = useState<'today' | '7days' | 'month' | 'custom'>('7days');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getHeadAnalytics(filterRange);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filterRange]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
        <p className="text-sm font-medium">Synthesizing state-wide analytics and cross-shop comparisons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Directorate Analytics</h1>
          <p className="text-xs text-slate-500">
            Multi-shop comparison, commodity inventory saturation, and sales distribution timelines.
          </p>
        </div>

        {/* Timeline Filters Required by Section 14: Today, 7 Days, This Month, Custom */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setFilterRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRange === 'today' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilterRange('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRange === '7days' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setFilterRange('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRange === 'month' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilterRange('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRange === 'custom' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of 4 Core Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Shop-wise Sales Comparison (SHOP-101 to SHOP-105) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Shop-wise Sales Comparison</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">SHOP-101 to SHOP-105</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.shopWiseSales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="shopId" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`₹${parseFloat(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="totalSales" name="Sales Revenue (₹)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Stock Analysis Across Shops */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              <span>Stock Available by Shop</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Available kg in Shops</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.stockMatrix || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="shopId" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${value} kg (${props.payload.itemName})`,
                    props.payload.itemCode
                  ]}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="currentStock" name="Current Stock (kg)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Item Distribution (Rice, Wheat, Sugar, Dal) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Item Distribution (Rice, Wheat, Sugar, Dal)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">State-wide Volume</span>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {data?.itemDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.itemDistribution}
                    dataKey="quantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.name}: ${entry.quantity} ${entry.unit}`}
                  >
                    {data.itemDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} ${props.payload.unit} (₹${props.payload.value.toFixed(2)})`,
                      name
                    ]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No distributed items recorded yet.</p>
            )}
          </div>
        </div>

        {/* 4. Order Status Breakdown (Pending, Ready, Delivered) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-500" />
              <span>Order Status Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Ready vs Delivered</span>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {data?.orderStatuses?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.orderStatuses}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {data.orderStatuses.map((entry: any, index: number) => {
                      const color =
                        entry.status === 'DELIVERED'
                          ? '#10b981'
                          : entry.status === 'READY'
                          ? '#f59e0b'
                          : '#64748b';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} Orders (₹${props.payload.amount.toFixed(2)})`,
                      name
                    ]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No orders placed yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Sales Timeline Trend Line Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Sales & Demand Timeline (State-wide Trajectory)</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  name === 'sales' ? `₹${parseFloat(value).toFixed(2)}` : value,
                  name === 'sales' ? 'Revenue' : 'Orders'
                ]}
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" name="Revenue (₹)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="orders" name="Order Count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
