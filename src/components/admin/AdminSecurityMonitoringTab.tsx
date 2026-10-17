import React from 'react';
import {
  ShieldAlert,
  Server,
  Zap,
  HardDrive,
  Activity,
  Lock,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { SystemMetrics } from '../../types/admin';

interface AdminSecurityMonitoringTabProps {
  metrics: SystemMetrics;
}

export const AdminSecurityMonitoringTab: React.FC<AdminSecurityMonitoringTabProps> = ({ metrics }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Infrastructure Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">PostgreSQL DB Pool</span>
            <Server className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
            {metrics.dbConnectionPoolPct}% Allocated
          </div>
          <p className="text-xs text-zinc-400">18 active connections out of 100 max pool limit</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">API Ingress Latency</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.avgLatencyMs} ms
          </div>
          <p className="text-xs text-zinc-400">Cloud Run container auto-scaled across US-Central1</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Realtime Error Stream</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
            {metrics.errorLogCount} Log Spikes
          </div>
          <p className="text-xs text-zinc-400">Zero fatal unhandled exceptions in past 24 hours</p>
        </div>
      </div>

      {/* Security Policies & Device Tracking */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-500" />
          <span>Active Super Admin Security Sessions &amp; IP Locks</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-white block">
                  Alexandra Vance (Super Admin)
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  IP: 192.168.1.104 • Chrome 128 / macOS Sequoia • MFA Verified
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              Active Current Session
            </span>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-white block">
                  David K. Miller (Platform Admin)
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  IP: 10.0.4.12 • Firefox 129 / Linux Ubuntu • MFA Verified
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[10px]">
              Idle 3 Hours Ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
