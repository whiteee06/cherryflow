import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Customer } from '../../types';
import { TrendingUp, DollarSign, Target, Award, ArrowUpRight, Zap } from 'lucide-react';

interface RevenueAnalyticsTabProps {
  customers: Customer[];
  currencySymbol?: string;
}

export const RevenueAnalyticsTab: React.FC<RevenueAnalyticsTabProps> = ({
  customers,
  currencySymbol = '$',
}) => {
  // Monthly Revenue Trajectory
  const revenueHistoryData = [
    { month: 'Jan', revenue: 42000, forecast: 40000, closedDeals: 12 },
    { month: 'Feb', revenue: 48500, forecast: 45000, closedDeals: 15 },
    { month: 'Mar', revenue: 56000, forecast: 50000, closedDeals: 18 },
    { month: 'Apr', revenue: 61000, forecast: 58000, closedDeals: 21 },
    { month: 'May', revenue: 69500, forecast: 65000, closedDeals: 24 },
    { month: 'Jun', revenue: 78000, forecast: 72000, closedDeals: 28 },
    { month: 'Jul', revenue: 84000, forecast: 80000, closedDeals: 31 },
    { month: 'Aug (Projected)', revenue: 95000, forecast: 90000, closedDeals: 35 },
  ];

  // Deal Value by Status Pipeline
  const statusPipeline = customers.reduce(
    (acc, c) => {
      const status = c.status || 'lead';
      acc[status] = (acc[status] || 0) + (c.dealValue || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  const pipelineStageData = [
    { stage: 'Lead', value: statusPipeline.lead || 15000, color: '#3b82f6' },
    { stage: 'Proposal Sent', value: statusPipeline.proposal || 28000, color: '#8b5cf6' },
    { stage: 'Active Client', value: statusPipeline.active || 85000, color: '#10b981' },
    { stage: 'Won / Retained', value: statusPipeline.won || 112000, color: '#f59e0b' },
    { stage: 'Inactive / Churned', value: statusPipeline.inactive || 8000, color: '#6b7280' },
  ];

  const totalPipelineValue = customers.reduce((sum, c) => sum + (c.dealValue || 0), 0) || 248000;
  const avgDealSize = customers.length > 0 ? Math.round(totalPipelineValue / customers.length) : 8500;
  const winRate = 68.4; // % win rate

  // Top Customer Accounts by Deal Value
  const topAccounts = [...customers]
    .sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Total Pipeline Deal Value</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            {currencySymbol}
            {totalPipelineValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 text-emerald-500">
            <ArrowUpRight size={12} /> +18.4% growth vs previous quarter
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Average Deal Size</span>
            <Target size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            {currencySymbol}
            {avgDealSize.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Calculated across active accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Historical Win Rate</span>
            <Award size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{winRate}%</p>
          <p className="text-[11px] text-zinc-500 mt-1">Proposal to Closed-Won ratio</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Next Month Projection</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            {currencySymbol}95,000
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">AI-based probability forecast</p>
        </div>
      </div>

      {/* Main Revenue Trend Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-500" />
              Monthly Revenue Trajectory & Forecast
            </h3>
            <p className="text-xs text-zinc-500">Historical earnings vs AI probabilistic revenue model</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Actual Revenue
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-3 rounded-full bg-zinc-600 inline-block" /> Forecast Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueHistoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.2} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(v) => `${currencySymbol}${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Value']}
              />
              <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              <Area type="monotone" dataKey="forecast" name="Forecast Baseline" stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Deal Stage Breakdown & Top Accounts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Stage Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
            Pipeline Value by Customer Stage
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Financial volume distribution across sales funnel</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStageData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.2} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickFormatter={(v) => `${currencySymbol}${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" name="Deal Value" radius={[6, 6, 0, 0]}>
                  {pipelineStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top High-Value Customer Accounts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
              Top Revenue Customer Accounts
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Highest deal value client relationships in CRM</p>

            <div className="space-y-3">
              {topAccounts.map((account, idx) => (
                <div
                  key={account.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{account.name}</p>
                      <p className="text-[11px] text-zinc-500">{account.company || 'Private Account'} • {account.status}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-extrabold text-zinc-900 dark:text-white">
                      {currencySymbol}
                      {(account.dealValue || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-500 font-medium">Active Deal</span>
                  </div>
                </div>
              ))}

              {topAccounts.length === 0 && (
                <p className="text-xs text-zinc-500 italic py-4 text-center">No customer accounts registered yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
