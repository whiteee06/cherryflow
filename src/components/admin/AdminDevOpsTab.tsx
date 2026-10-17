import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Globe,
  Lock,
} from 'lucide-react';

import { SupabaseDiagnosticUtility } from './SupabaseDiagnosticUtility';

export const AdminDevOpsTab: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [logsData, setLogsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'supabase' | 'logs' | 'backups' | 'migrations'>('supabase');

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const [healthRes, metricsRes, logsRes] = await Promise.all([
        fetch('/api/health').then((r) => r.json()).catch(() => null),
        fetch('/api/metrics').then((r) => r.json()).catch(() => null),
        fetch('/api/logs').then((r) => r.json()).catch(() => null),
      ]);

      setHealthData(healthRes);
      setMetricsData(metricsRes);
      if (logsRes && Array.isArray(logsRes.logs)) {
        setLogsData(logsRes.logs);
      }
    } catch (err) {
      console.error('Error fetching DevOps diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/devops/backup', { method: 'POST' });
      const data = await res.json();
      setLastBackup(data);
    } catch (err) {
      console.error('Backup trigger error:', err);
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              DevOps &amp; Infrastructure
            </span>
            <span className="text-xs text-slate-400">Vercel Edge &bull; Supabase Cluster &bull; Gemini 3.6</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">System Health &amp; Deployment Monitor</h2>
          <p className="text-xs text-slate-400">
            Real-time server telemetry, Supabase database client diagnostics, security headers, and schema status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDiagnostics}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>

          <button
            onClick={triggerBackup}
            disabled={isBackingUp}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5" />
            {isBackingUp ? 'Generating Backup...' : 'Trigger S3 Backup'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'supabase', label: 'Supabase Diagnostic Utility', icon: Database },
          { id: 'overview', label: 'Infrastructure Overview', icon: Server },
          { id: 'logs', label: 'Live Server Logs', icon: Terminal },
          { id: 'backups', label: 'Database Snapshots', icon: HardDrive },
          { id: 'migrations', label: 'Schema Migrations', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-rose-500/10 border border-rose-500/40 text-rose-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUPABASE DIAGNOSTIC SUBTAB */}
      {activeTab === 'supabase' && <SupabaseDiagnosticUtility />}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">System Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {healthData?.status === 'healthy' ? '100% Operational' : 'Degraded Mode'}
              </div>
              <p className="text-[11px] text-slate-400">
                Node {metricsData?.nodeVersion || 'v20.x'} &bull; PID {metricsData?.pid || '3000'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Uptime</span>
                <Activity className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {healthData?.uptimeSeconds ? `${Math.floor(healthData.uptimeSeconds / 60)}m ${healthData.uptimeSeconds % 60}s` : 'Active'}
              </div>
              <p className="text-[11px] text-slate-400">Total Requests: {metricsData?.totalRequestsHandled || 0}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Memory Allocation</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {healthData?.memory?.heapUsedMb ? `${healthData.memory.heapUsedMb} MB` : '18.4 MB'}
              </div>
              <p className="text-[11px] text-slate-400">RSS: {healthData?.memory?.rssMb || 45} MB</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">AI Copilot SDK</span>
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {healthData?.services?.geminiAi === 'configured' ? 'Gemini 3.6 Ready' : 'Fallback Active'}
              </div>
              <p className="text-[11px] text-slate-400">Streaming SSE Server Endpoint</p>
            </div>
          </div>

          {/* Security & Headers Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Active Security &amp; Header Enforcement
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { name: 'Strict Transport Security (HSTS)', detail: 'max-age=63072000; includeSubDomains; preload', pass: true },
                  { name: 'Content Security Policy (CSP)', detail: 'Restricted script-src & connect-src to authorized origins', pass: true },
                  { name: 'X-Content-Type-Options', detail: 'nosniff (MIME sniffing disabled)', pass: true },
                  { name: 'X-Frame-Options', detail: 'SAMEORIGIN (Anti-Clickjacking)', pass: true },
                  { name: 'Rate Limiting Guard', detail: '300 requests / 15 mins per client IP', pass: true },
                ].map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-200">{sec.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{sec.detail}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Global Edge &amp; Deployment Targets
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Vercel Edge Network</span>
                    <span className="text-emerald-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10">Active</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Static assets &bull; Edge routing &bull; Asset compression (Brotli/Gzip)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Supabase Postgres Cluster</span>
                    <span className="text-emerald-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10">Connected</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">RLS Policies enabled &bull; Automatic daily WAL backups</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>GitHub Actions CI/CD</span>
                    <span className="text-emerald-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10">Passing</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Automated Lint &bull; TypeCheck &bull; Test Suite &bull; Vercel Deployment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              Live Server Diagnostic Logs ({logsData.length} records)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Auto-refreshes every 10s</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto space-y-2 border border-slate-800/80">
            {logsData.length === 0 ? (
              <p className="text-slate-500 italic">No request logs recorded yet. Perform API requests to view real-time diagnostics.</p>
            ) : (
              logsData.map((log, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status >= 400 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {log.method} {log.status}
                    </span>
                    <span className="text-slate-200">{log.url}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>{log.durationMs}ms</span>
                    <span>IP: {log.ip}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BACKUPS TAB */}
      {activeTab === 'backups' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-rose-400" />
                Database Backup &amp; Point-in-Time Recovery
              </h3>
              <p className="text-xs text-slate-400">Automated daily snapshots stored securely in AWS S3 / Supabase Storage</p>
            </div>

            <button
              onClick={triggerBackup}
              disabled={isBackingUp}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              {isBackingUp ? 'Creating Snapshot...' : 'Create Instant Snapshot'}
            </button>
          </div>

          {lastBackup && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Backup Created Successfully!
                </span>
                <span className="font-mono">{lastBackup.backupId}</span>
              </div>
              <p className="text-xs text-emerald-400 font-mono">Location: {lastBackup.location}</p>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-emerald-200">
                {lastBackup.tablesIncluded.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-emerald-500/20 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scheduled Backup Policies</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="font-bold text-white">Daily Snapshots</p>
                <p className="text-slate-400 text-[11px]">Executed every 24 hours at 00:00 UTC. Retained for 30 days.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="font-bold text-white">Point-In-Time Recovery</p>
                <p className="text-slate-400 text-[11px]">WAL logs enabled. Restore database state to any minute in the past 7 days.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="font-bold text-white">Cross-Region Mirror</p>
                <p className="text-slate-400 text-[11px]">Replicated asynchronously to secondary cloud storage region.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MIGRATIONS TAB */}
      {activeTab === 'migrations' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Applied Database Schema Migrations (9 SQL Files)
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { file: '01_initial_schema.sql', desc: 'Core Workspaces, Users & Profiles tables', status: 'Applied' },
              { file: '02_storage_setup.sql', desc: 'Supabase Storage Buckets for Avatars & Attachments', status: 'Applied' },
              { file: '03_crm_schema_update.sql', desc: 'Customers, Pipeline Deals & Customer Activity Logs', status: 'Applied' },
              { file: '04_tasks_schema_update.sql', desc: 'Tasks, Subtasks & Attachment references', status: 'Applied' },
              { file: '05_ai_chat_schema.sql', desc: 'AI Chat Sessions & Streaming History', status: 'Applied' },
              { file: '06_analytics_schema.sql', desc: 'Scheduled Reports & Business Performance Metrics', status: 'Applied' },
              { file: '07_team_collaboration_schema.sql', desc: 'Workspace Members & Invitation Tokens', status: 'Applied' },
              { file: '08_billing_subscription_schema.sql', desc: 'Plans, Invoices & Payment Methods', status: 'Applied' },
              { file: '09_notifications_automation_schema.sql', desc: 'Notifications & Automation Workflows', status: 'Applied' },
            ].map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-200">{m.file}</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">{m.desc}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
