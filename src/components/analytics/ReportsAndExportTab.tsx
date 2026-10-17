import React, { useState, useEffect } from 'react';
import { Customer, Task, Note, ScheduledReport, TimeframePeriod } from '../../types';
import { AnalyticsService } from '../../services/AnalyticsService';
import { ScheduledReportModal } from './ScheduledReportModal';
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Clock,
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ReportsAndExportTabProps {
  customers: Customer[];
  tasks: Task[];
  notes: Note[];
  currencySymbol?: string;
}

export const ReportsAndExportTab: React.FC<ReportsAndExportTabProps> = ({
  customers,
  tasks,
  notes,
  currencySymbol = '$',
}) => {
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);

  const loadScheduledReports = async () => {
    const reports = await AnalyticsService.getScheduledReports();
    setScheduledReports(reports);
  };

  useEffect(() => {
    loadScheduledReports();
  }, []);

  // Compute stats for selected report timeframe
  const filteredCustomers = AnalyticsService.filterByTimeframe(customers, selectedReportPeriod);
  const filteredTasks = AnalyticsService.filterByTimeframe(tasks, selectedReportPeriod);
  const filteredNotes = AnalyticsService.filterByTimeframe(notes, selectedReportPeriod);

  const completedFilteredTasks = filteredTasks.filter((t) => t.status === 'completed').length;
  const newDealsValue = filteredCustomers.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  // --- EXPORT HANDLERS ---
  const handleExportCustomersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Company', 'Status', 'Deal Value', 'Phone', 'Created At'];
    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.email || '',
      c.company || '',
      c.status,
      c.dealValue || 0,
      c.phone || '',
      c.createdAt || '',
    ]);
    AnalyticsService.exportToCSV('CherryFlow_Customers', headers, rows);
  };

  const handleExportTasksCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Assigned User', 'Due Date', 'Customer Name', 'Created At'];
    const rows = tasks.map((t) => [
      t.id,
      t.title,
      t.status,
      t.priority,
      t.assignedUser || '',
      t.dueDate || '',
      t.customerName || '',
      t.createdAt || '',
    ]);
    AnalyticsService.exportToCSV('CherryFlow_Tasks', headers, rows);
  };

  const handleExportRevenueCSV = () => {
    const headers = ['Customer Name', 'Company', 'Deal Stage', 'Deal Value', 'Last Contact Date'];
    const rows = customers.map((c) => [
      c.name,
      c.company || '',
      c.status,
      c.dealValue || 0,
      c.lastContactDate || '',
    ]);
    AnalyticsService.exportToCSV('CherryFlow_Revenue_Pipeline', headers, rows);
  };

  const handleExportJSON = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      reportPeriod: selectedReportPeriod,
      summary: {
        totalCustomersCount: customers.length,
        filteredCustomersCount: filteredCustomers.length,
        totalTasksCount: tasks.length,
        completedTasksCount: completedFilteredTasks,
        totalNotesCount: notes.length,
        pipelineValue: customers.reduce((sum, c) => sum + (c.dealValue || 0), 0),
      },
      customers,
      tasks,
      notes,
    };
    AnalyticsService.exportToJSON('CherryFlow_Full_Telemetry', exportData);
  };

  const handlePrintPDFReport = () => {
    const periodLabel = selectedReportPeriod.toUpperCase();
    const contentHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">New Customers (${periodLabel})</div>
          <div class="kpi-value">${filteredCustomers.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Completed Tasks (${periodLabel})</div>
          <div class="kpi-value">${completedFilteredTasks}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">New Deal Value (${periodLabel})</div>
          <div class="kpi-value">${currencySymbol}${newDealsValue.toLocaleString()}</div>
        </div>
      </div>

      <h3 style="margin-top: 24px;">Recent Customer Accounts (${periodLabel})</h3>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Company</th>
            <th>Status</th>
            <th>Deal Value</th>
          </tr>
        </thead>
        <tbody>
          ${filteredCustomers
            .slice(0, 10)
            .map(
              (c) => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.company || '-'}</td>
              <td>${c.status.toUpperCase()}</td>
              <td>${currencySymbol}${(c.dealValue || 0).toLocaleString()}</td>
            </tr>
          `
            )
            .join('')}
          ${filteredCustomers.length === 0 ? '<tr><td colspan="4">No customer accounts created in this timeframe.</td></tr>' : ''}
        </tbody>
      </table>

      <h3 style="margin-top: 24px;">Completed Deliverables</h3>
      <table>
        <thead>
          <tr>
            <th>Task Title</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTasks
            .filter((t) => t.status === 'completed')
            .slice(0, 10)
            .map(
              (t) => `
            <tr>
              <td>${t.title}</td>
              <td>${t.priority.toUpperCase()}</td>
              <td>${t.dueDate || '-'}</td>
              <td>COMPLETED</td>
            </tr>
          `
            )
            .join('')}
          ${filteredTasks.filter((t) => t.status === 'completed').length === 0 ? '<tr><td colspan="4">No tasks completed in this timeframe.</td></tr>' : ''}
        </tbody>
      </table>
    `;

    AnalyticsService.generatePrintReport(`${selectedReportPeriod.toUpperCase()} Executive Summary`, contentHtml);
  };

  const handleToggleActive = async (report: ScheduledReport) => {
    await AnalyticsService.saveScheduledReport({ ...report, isActive: !report.isActive });
    loadScheduledReports();
  };

  const handleDeleteReport = async (id: string) => {
    await AnalyticsService.deleteScheduledReport(id);
    loadScheduledReports();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Timeframe Selector Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar size={18} className="text-rose-500" />
            Executive Timeframe Reports
          </h3>
          <p className="text-xs text-zinc-500">
            Generate and view structured business summaries filtered by timeframe period.
          </p>
        </div>

        {/* Timeframe buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedReportPeriod(period)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedReportPeriod === period
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {period} Report
            </button>
          ))}
        </div>
      </div>

      {/* Live Generated Summary Card */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-rose-500" />
            <h4 className="text-lg font-bold capitalize">{selectedReportPeriod} Executive Performance Summary</h4>
          </div>
          <button
            onClick={handlePrintPDFReport}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            <Printer size={14} />
            Print / PDF Report
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">New Accounts</p>
            <p className="text-2xl font-extrabold text-white mt-1">{filteredCustomers.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Tasks Completed</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{completedFilteredTasks}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Pipeline Volume</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">
              {currencySymbol}
              {newDealsValue.toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Notes Generated</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{filteredNotes.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
          <p className="font-bold text-white mb-1">💡 Executive Insight Snapshot:</p>
          <p>
            During this <strong>{selectedReportPeriod}</strong> window, your business added{' '}
            <strong>{filteredCustomers.length}</strong> new customer relationships with a cumulative pipeline value of{' '}
            <strong>
              {currencySymbol}
              {newDealsValue.toLocaleString()}
            </strong>
            . Your operational execution rate achieved <strong>{completedFilteredTasks}</strong> finished task deliverables.
          </p>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
          <Download size={18} className="text-rose-500" />
          Export Telemetry Data
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Download structured CSV, JSON, or printable documents for offline auditing or accounting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={handleExportCustomersCSV}
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={18} />
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Export Customers CSV</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Full CRM contacts & deal values</p>
          </button>

          <button
            onClick={handleExportTasksCSV}
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 w-fit mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={18} />
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Export Task Logs CSV</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Task statuses, priorities & deadlines</p>
          </button>

          <button
            onClick={handleExportRevenueCSV}
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 w-fit mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={18} />
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Export Revenue CSV</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Pipeline deal value distribution</p>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-2 group-hover:scale-105 transition-transform">
              <FileCode size={18} />
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Export Raw JSON</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Complete database snapshot</p>
          </button>
        </div>
      </div>

      {/* Scheduled Reports Config Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-rose-500" />
              Automated Scheduled Reports Manager
            </h3>
            <p className="text-xs text-zinc-500">Configure recurring email or PDF report deliveries to your team</p>
          </div>

          <button
            onClick={() => {
              setEditingReport(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5 w-fit"
          >
            <Plus size={14} />
            Add Scheduled Report
          </button>
        </div>

        <div className="space-y-3">
          {scheduledReports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    report.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-400'
                  }`}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{report.title}</p>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[10px] font-extrabold uppercase text-zinc-700 dark:text-zinc-300">
                      {report.reportType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-extrabold uppercase">
                      {report.format}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Recipients: {report.recipients.join(', ') || 'owner@cherryflow.io'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => handleToggleActive(report)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    report.isActive
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                  }`}
                >
                  {report.isActive ? 'Active' : 'Paused'}
                </button>

                <button
                  onClick={() => {
                    setEditingReport(report);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 cursor-pointer rounded-lg hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {scheduledReports.length === 0 && (
            <p className="text-xs text-zinc-500 italic py-6 text-center">No scheduled reports configured yet.</p>
          )}
        </div>
      </div>

      <ScheduledReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportToEdit={editingReport}
        onReportSaved={loadScheduledReports}
      />
    </div>
  );
};
