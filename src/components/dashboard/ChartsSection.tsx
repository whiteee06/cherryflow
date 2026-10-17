import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { RevenueMetric, Customer } from '../../types';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface ChartsSectionProps {
  revenueHistory: RevenueMetric[];
  customers: Customer[];
  currencySymbol?: string;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  revenueHistory,
  customers,
  currencySymbol = '$',
}) => {
  // Compute customer status breakdown for Pie Chart
  const statusCounts = customers.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = [
    { name: 'VIP Clients', value: statusCounts.vip || 0, color: '#e11d48' }, // Rose-600
    { name: 'Active', value: statusCounts.active || 0, color: '#10b981' }, // Emerald-500
    { name: 'Prospects', value: statusCounts.prospect || 0, color: '#f59e0b' }, // Amber-500
    { name: 'Leads', value: statusCounts.lead || 0, color: '#8b5cf6' }, // Purple-500
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue & Growth Area Chart (2 Cols) */}
      <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-600 dark:text-rose-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Revenue & Growth Trajectory</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Monthly revenue vs business operating expenses</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
              <span className="text-zinc-600 dark:text-zinc-400">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-600 inline-block" />
              <span className="text-zinc-600 dark:text-zinc-400">Expenses</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
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
                formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, '']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#e11d48"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGrad)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#expenseGrad)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Pipeline Distribution (1 Col) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieIcon size={18} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Customer Pipeline Breakdown</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Distribution by account status</p>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-zinc-900 dark:text-white">{customers.length}</span>
              <span className="text-[10px] text-zinc-500">Total Accounts</span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[80px]">{item.name}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
