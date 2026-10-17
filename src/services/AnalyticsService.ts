import { supabase } from '../lib/supabase';
import {
  Customer,
  Task,
  Note,
  ScheduledReport,
  TimeframePeriod,
  ChatSession,
} from '../types';

const SCHEDULED_REPORTS_STORAGE_KEY = 'cherryflow_scheduled_reports_v1';

export const DEFAULT_SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'report_1',
    title: 'Daily Standup & Task Digest',
    reportType: 'daily',
    recipients: ['owner@cherryflow.io'],
    format: 'email',
    isActive: true,
    lastSentAt: new Date(Date.now() - 86400000).toISOString(),
    nextRunAt: new Date(Date.now() + 43200000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'report_2',
    title: 'Weekly Executive Revenue & CRM Digest',
    reportType: 'weekly',
    recipients: ['executives@cherryflow.io', 'sales@cherryflow.io'],
    format: 'pdf',
    isActive: true,
    lastSentAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    nextRunAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'report_3',
    title: 'Monthly Business Performance & AI Usage Report',
    reportType: 'monthly',
    recipients: ['analytics@cherryflow.io'],
    format: 'csv',
    isActive: false,
    lastSentAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    nextRunAt: new Date(Date.now() + 10 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export class AnalyticsService {
  // --- SCHEDULED REPORTS SERVICE ---
  static getLocalScheduledReports(): ScheduledReport[] {
    try {
      const stored = localStorage.getItem(SCHEDULED_REPORTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading scheduled reports from local storage:', e);
    }
    localStorage.setItem(SCHEDULED_REPORTS_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULED_REPORTS));
    return DEFAULT_SCHEDULED_REPORTS;
  }

  static saveLocalScheduledReports(reports: ScheduledReport[]): void {
    try {
      localStorage.setItem(SCHEDULED_REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.warn('Error saving scheduled reports to local storage:', e);
    }
  }

  static async getScheduledReports(): Promise<ScheduledReport[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('scheduled_reports').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            reportType: d.report_type,
            recipients: d.recipients || [],
            format: d.format || 'pdf',
            isActive: d.is_active,
            lastSentAt: d.last_sent_at,
            nextRunAt: d.next_run_at,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getScheduledReports error, using local:', err);
      }
    }
    return this.getLocalScheduledReports();
  }

  static async saveScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt'> & { id?: string }): Promise<ScheduledReport> {
    const isNew = !report.id;
    const newReport: ScheduledReport = {
      id: report.id || `report_${Date.now()}`,
      title: report.title,
      reportType: report.reportType,
      recipients: report.recipients,
      format: report.format,
      isActive: report.isActive,
      lastSentAt: report.lastSentAt,
      nextRunAt: report.nextRunAt || new Date(Date.now() + 86400000 * 7).toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isNew) {
          await supabase.from('scheduled_reports').insert({
            title: newReport.title,
            report_type: newReport.reportType,
            recipients: newReport.recipients,
            format: newReport.format,
            is_active: newReport.isActive,
            next_run_at: newReport.nextRunAt,
          });
        } else {
          await supabase
            .from('scheduled_reports')
            .update({
              title: newReport.title,
              report_type: newReport.reportType,
              recipients: newReport.recipients,
              format: newReport.format,
              is_active: newReport.isActive,
              next_run_at: newReport.nextRunAt,
            })
            .eq('id', newReport.id);
        }
      } catch (err) {
        console.warn('Supabase saveScheduledReport error:', err);
      }
    }

    const current = this.getLocalScheduledReports();
    const updated = isNew ? [newReport, ...current] : current.map((r) => (r.id === newReport.id ? newReport : r));
    this.saveLocalScheduledReports(updated);
    return newReport;
  }

  static async deleteScheduledReport(id: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('scheduled_reports').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteScheduledReport error:', err);
      }
    }
    const current = this.getLocalScheduledReports().filter((r) => r.id !== id);
    this.saveLocalScheduledReports(current);
  }

  // --- EXPORT HELPERS ---
  static exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToJSON(filename: string, data: any): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static generatePrintReport(title: string, contentHtml: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - CherryFlow Executive Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #18181b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 24px; color: #e11d48; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #71717a; margin-bottom: 24px; border-bottom: 2px solid #f4f4f5; padding-bottom: 12px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
            .kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
            .kpi-label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
            .kpi-value { font-size: 22px; font-weight: 800; color: #111827; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f3f4f6; font-weight: 700; color: #374151; }
            .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          </style>
        </head>
        <body>
          <h1>CherryFlow Business Executive Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Confidential</div>
          ${contentHtml}
          <div class="footer">Confidential • Generated by CherryFlow CRM & Analytics Suite</div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // --- COMPUTE TIMEFRAME METRICS ---
  static filterByTimeframe<T extends { createdAt?: string; date?: string; updatedAt?: string }>(
    items: T[],
    timeframe: TimeframePeriod
  ): T[] {
    if (timeframe === 'all') return items;

    const now = new Date();
    const cutoff = new Date();

    if (timeframe === 'daily') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === 'weekly') {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeframe === 'monthly') {
      cutoff.setDate(now.getDate() - 30);
    } else if (timeframe === 'yearly') {
      cutoff.setDate(now.getDate() - 365);
    }

    return items.filter((item) => {
      const dateStr = item.createdAt || item.updatedAt || item.date;
      if (!dateStr) return true;
      const d = new Date(dateStr);
      return d >= cutoff;
    });
  }
}
