import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Sparkles, Bot, Cpu, Zap, MessageSquare, Clock, CheckCircle, ArrowUpRight } from 'lucide-react';

export const AIUsageAnalyticsTab: React.FC = () => {
  // Mock AI Telemetry
  const promptCategoryData = [
    { name: 'Sales & Outreach Emails', count: 48, fill: '#e11d48' },
    { name: 'Business Proposals', count: 32, fill: '#8b5cf6' },
    { name: 'Meeting Note Summaries', count: 29, fill: '#3b82f6' },
    { name: 'Task Generation', count: 24, fill: '#10b981' },
    { name: 'Brainstorming & CRM Strategy', count: 18, fill: '#f59e0b' },
  ];

  const weeklyTokensData = [
    { day: 'Mon', tokens: 18400, sessions: 12 },
    { day: 'Tue', tokens: 24200, sessions: 16 },
    { day: 'Wed', tokens: 31000, sessions: 22 },
    { day: 'Thu', tokens: 19500, sessions: 14 },
    { day: 'Fri', tokens: 28900, sessions: 19 },
    { day: 'Sat', tokens: 8500, sessions: 6 },
    { day: 'Sun', tokens: 5200, sessions: 4 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Telemetry KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Total AI Copilot Sessions</span>
            <MessageSquare size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">142 Sessions</p>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 text-emerald-500">
            <ArrowUpRight size={12} /> +24.5% vs previous month
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Tokens Consumed</span>
            <Cpu size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">135.7k Tokens</p>
          <p className="text-[11px] text-zinc-500 mt-1">Average ~955 tokens/prompt</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Average SSE Stream Latency</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">420 ms</p>
          <p className="text-[11px] text-zinc-500 mt-1">First token time-to-first-byte</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Estimated Hours Saved</span>
            <Clock size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">38.5 Hours</p>
          <p className="text-[11px] text-emerald-500 mt-1">In proposal & outreach drafting</p>
        </div>
      </div>

      {/* Main Token Usage & Prompt Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Tokens Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-rose-500" />
                Token Consumption & Session Velocity
              </h3>
              <p className="text-xs text-zinc-500">Daily token volume processed by Gemini models</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              Gemini 3.6 Flash
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTokensData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.2} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} tokens`, 'Volume']}
                />
                <Bar dataKey="tokens" name="Tokens Used" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prompt Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
            Prompt Library Usage by Category
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Most executed AI automation templates</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promptCategoryData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" opacity={0.2} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Executions" radius={[0, 6, 6, 0]}>
                  {promptCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
