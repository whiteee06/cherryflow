import React from 'react';
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  Bot,
  HardDrive,
  Activity,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Clock,
  Server,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Play,
  Pause,
  Database,
} from 'lucide-react';
import { SystemMetrics } from '../../types/admin';

interface AdminOverviewTabProps {
  metrics: SystemMetrics;
  isMaintenanceMode: boolean;
  onToggleMaintenanceMode: () => void;
  onSelectTab: (tab: string) => void;
  onOpenTestingGuide: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  metrics,
  isMaintenanceMode,
  onToggleMaintenanceMode,
  onSelectTab,
  onOpenTestingGuide,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Alert if Maintenance Mode */}
      {isMaintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-sm">Maintenance Mode is Currently ACTIVE</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Non-admin users will see the platform maintenance screen. Super Admins retain full access.
              </p>
            </div>
          </div>
          <button
            onClick={onToggleMaintenanceMode}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            Deactivate Maintenance Mode
          </button>
        </div>
      )}

      {/* Hero Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-rose-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold uppercase tracking-wider">
              Super Admin Console
            </span>
            <span className="text-xs text-zinc-400 font-mono">• Node.js / Cloud Run Isolated Environment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Operations & Global Governance
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Realtime performance metrics, multi-tenant workspace management, Gemini AI token consumption, and audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenTestingGuide}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Setup & Testing Guide</span>
          </button>

          <button
            onClick={onToggleMaintenanceMode}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 ${
              isMaintenanceMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isMaintenanceMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isMaintenanceMode ? 'Resume Platform' : 'Enable Maintenance'}</span>
          </button>
        </div>
      </div>

      {/* KPI Grid (12 Key Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div
          onClick={() => onSelectTab('users')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.totalUsers.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.newSignupsThisMonth} this mo
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            Active User Ratio: {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}%
          </span>
        </div>

        {/* Metric 2: Total Workspaces */}
        <div
          onClick={() => onSelectTab('workspaces')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Workspaces
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.totalWorkspaces.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 98.2% Active
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">Multi-tenant isolation active</span>
        </div>

        {/* Metric: Supabase Diagnostic */}
        <div
          onClick={() => onSelectTab('supabase_diagnostic')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Supabase Client
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Connected
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              24ms Ping
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">Click to open diagnostic utility &rarr;</span>
        </div>

        {/* Metric 3: Active Subscriptions & MRR */}
        <div
          onClick={() => onSelectTab('subscriptions')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Monthly Revenue (MRR)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              ${metrics.monthlyRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            {metrics.activeSubscriptions} Paid Accounts
          </span>
        </div>

        {/* Metric 4: AI Requests & Tokens */}
        <div
          onClick={() => onSelectTab('ai')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Gemini AI Requests
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.aiRequests.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
              89.4M Tokens
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">Gemini 2.5 Flash Native</span>
        </div>

        {/* Metric 5: System Health */}
        <div
          onClick={() => onSelectTab('monitoring')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              System Health
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.systemHealthPct}%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Optimal</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">Cloud Run Uptime Guaranteed</span>
        </div>

        {/* Metric 6: API Calls & Latency */}
        <div
          onClick={() => onSelectTab('monitoring')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Avg API Latency
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.avgLatencyMs} ms
            </span>
            <span className="text-xs font-mono text-zinc-400">{(metrics.apiCallsTotal / 1000000).toFixed(2)}M calls</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">PostgreSQL / Firestore Cache</span>
        </div>

        {/* Metric 7: Storage Usage */}
        <div
          onClick={() => onSelectTab('workspaces')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Cloud Storage Used
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.storageUsedGb} GB
            </span>
            <span className="text-xs font-bold text-zinc-400">/ 1,000 GB</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">14.2% Capacity Allocated</span>
        </div>

        {/* Metric 8: Error Logs */}
        <div
          onClick={() => onSelectTab('monitoring')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Error Log Spikes
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.errorLogCount}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Low &amp; Stable</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">0 Critical System Blickers</span>
        </div>
      </div>

      {/* Charts & Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Revenue Trajectory & AI Consumption */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  Monthly Recurring Revenue (MRR) Growth
                </h3>
                <p className="text-xs text-zinc-500">Trailing 6 Months SaaS Subscription Trajectory</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                +$48.9k / mo
              </span>
            </div>

            {/* Simple Visual Revenue Graph Bars */}
            <div className="h-48 pt-6 flex items-end justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              {[
                { month: 'Mar', value: 18400, height: '38%' },
                { month: 'Apr', value: 24100, height: '49%' },
                { month: 'May', value: 31200, height: '63%' },
                { month: 'Jun', value: 38900, height: '79%' },
                { month: 'Jul', value: 43200, height: '88%' },
                { month: 'Aug', value: 48900, height: '100%' },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(item.value / 1000).toFixed(1)}k
                  </span>
                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl transition-all group-hover:brightness-110 shadow-sm"
                  />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{item.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
              <span>Average Revenue Per Account (ARPA): $142.80</span>
              <span>Net Revenue Retention (NRR): 118%</span>
            </div>
          </div>

          {/* AI Usage Breakdown */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  AI Copilot Token Consumption by Model
                </h3>
                <p className="text-xs text-zinc-500">Live API quota utilization across workspaces</p>
              </div>
              <button
                onClick={() => onSelectTab('ai')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Configure Models & Limits →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-zinc-800 dark:text-zinc-200">Gemini 2.5 Flash (Primary)</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono">72,400,000 tokens (81%)</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[81%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-zinc-800 dark:text-zinc-200">Gemini 2.5 Pro (Deep Research / Custom)</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono">14,200,000 tokens (16%)</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-600 rounded-full w-[16%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-zinc-800 dark:text-zinc-200">Other / Experimental Pipelines</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">2,800,000 tokens (3%)</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[3%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Quick Controls & System Health */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">Admin Quick Controls</h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => onSelectTab('users')}
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-800 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">User Management</span>
                    <span className="text-zinc-500">Search, suspend, or reset passwords</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500" />
              </button>

              <button
                onClick={() => onSelectTab('support')}
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-800 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">Support Ticket Inbox</span>
                    <span className="text-zinc-500">2 tickets pending customer reply</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500" />
              </button>

              <button
                onClick={() => onSelectTab('settings')}
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-800 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">Feature Flags & System</span>
                    <span className="text-zinc-500">Toggle live features & SMTP settings</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500" />
              </button>

              <button
                onClick={() => onSelectTab('audit_logs')}
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-800 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">Security & Audit Logs</span>
                    <span className="text-zinc-500">View real-time admin action trail</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500" />
              </button>
            </div>
          </div>

          {/* Infrastructure Health Status Box */}
          <div className="bg-zinc-900 text-white rounded-3xl border border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="font-bold text-sm">Services Infrastructure</h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Cloud Run US-Central1</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400">Database Connection Pool</span>
                <span className="font-mono text-emerald-400 font-bold">18% Allocated (Postgres)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400">Stripe Billing Webhook Relay</span>
                <span className="font-mono text-emerald-400 font-bold">Operational</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400">Gemini 2.5 API Gateways</span>
                <span className="font-mono text-emerald-400 font-bold">Latency 42ms</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-400">Outbound SMTP Relay</span>
                <span className="font-mono text-emerald-400 font-bold">SendGrid Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
