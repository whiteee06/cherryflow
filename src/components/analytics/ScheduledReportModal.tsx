import React, { useState } from 'react';
import { ScheduledReport } from '../../types';
import { AnalyticsService } from '../../services/AnalyticsService';
import { X, Calendar, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface ScheduledReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportToEdit?: ScheduledReport | null;
  onReportSaved: () => void;
}

export const ScheduledReportModal: React.FC<ScheduledReportModalProps> = ({
  isOpen,
  onClose,
  reportToEdit,
  onReportSaved,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(reportToEdit?.title || 'Weekly Executive Digest');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    reportToEdit?.reportType || 'weekly'
  );
  const [format, setFormat] = useState<'pdf' | 'csv' | 'email'>(reportToEdit?.format || 'pdf');
  const [recipients, setRecipients] = useState(
    reportToEdit?.recipients ? reportToEdit.recipients.join(', ') : 'owner@cherryflow.io'
  );
  const [isActive, setIsActive] = useState(reportToEdit?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const emailList = recipients
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      await AnalyticsService.saveScheduledReport({
        id: reportToEdit?.id,
        title,
        reportType,
        format,
        recipients: emailList.length > 0 ? emailList : ['owner@cherryflow.io'],
        isActive,
      });

      onReportSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save scheduled report:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {reportToEdit ? 'Edit Scheduled Report' : 'Configure New Scheduled Report'}
            </h3>
            <p className="text-xs text-zinc-500">Automate recurring business telemetry delivery</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Report Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Executive Weekly Revenue Digest"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Frequency Schedule
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="daily">Daily Standup</option>
                <option value="weekly">Weekly Digest</option>
                <option value="monthly">Monthly Audit</option>
                <option value="yearly">Yearly Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="pdf">PDF Attachment</option>
                <option value="csv">CSV Spreadsheet</option>
                <option value="email">Rich HTML Email Body</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
              <Mail size={14} className="text-zinc-400" />
              Recipient Email Addresses
            </label>
            <input
              type="text"
              required
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="e.g. alex@company.com, sarah@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Separate multiple emails with commas.</p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Active Delivery Status</p>
              <p className="text-[11px] text-zinc-500">Enable or pause automatic generation</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {isActive ? 'Active' : 'Paused'}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              {isSaving ? 'Saving...' : 'Save Scheduled Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
