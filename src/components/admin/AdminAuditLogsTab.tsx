import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AuditLog } from '../../types/admin';

interface AdminAuditLogsTabProps {
  auditLogs: AuditLog[];
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);

    const matchesTarget = targetTypeFilter === 'all' || log.targetType === targetTypeFilter;

    return matchesSearch && matchesTarget;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Admin Email', 'Action', 'Target Type', 'Target ID', 'Details', 'IP Address', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.adminEmail,
      `"${l.action}"`,
      l.targetType,
      l.targetId || '',
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cherryflow_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Control Bar */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, admin email, details, or IP..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Target Categories</option>
            <option value="security">Security &amp; Sessions</option>
            <option value="user">User Accounts</option>
            <option value="workspace">Workspaces</option>
            <option value="subscription">Subscriptions &amp; Billing</option>
            <option value="system">System &amp; Feature Flags</option>
            <option value="ai">AI Model Operations</option>
            <option value="support_ticket">Support Tickets</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Immutable Governance Audit Log ({filteredLogs.length} Events)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">SOC2 &amp; HIPAA Compliant Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Details &amp; Event Payload</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                    {log.adminEmail}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                      {log.targetType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-md font-sans text-zinc-800 dark:text-zinc-200">
                    {log.details}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
