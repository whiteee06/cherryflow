import React, { useState, useEffect } from 'react';
import { NotificationPreferences } from '../../types';
import { NotificationService } from '../../services/NotificationService';
import { X, Bell, Mail, Smartphone, Save, ShieldCheck } from 'lucide-react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  userId = 'user-primary-owner',
}) => {
  if (!isOpen) return null;

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    NotificationService.getPreferences(userId).then(setPrefs);
  }, [userId]);

  if (!prefs) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await NotificationService.savePreferences(prefs);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <Bell size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-zinc-500">
              Configure how and when you receive in-app alerts and email notifications.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Email Notifications Group */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <Mail size={16} className="text-rose-500" />
              <span>Email Notification Channels</span>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              {[
                { key: 'emailCrm', label: 'CRM & Customer Activity Updates' },
                { key: 'emailTasks', label: 'Task Assignments & Overdue Alerts' },
                { key: 'emailBilling', label: 'Billing Invoices & Plan Subscriptions' },
                { key: 'emailSystem', label: 'System Updates & Maintenance News' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(prefs as any)[item.key]}
                    onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded-sm cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* In-App Notifications Group */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <Bell size={16} className="text-rose-500" />
              <span>In-App Banner & Drawer Categories</span>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              {[
                { key: 'inAppCrm', label: 'CRM Leads & Pipeline Status Changes' },
                { key: 'inAppTasks', label: 'Tasks & Team Activity Comments' },
                { key: 'inAppAi', label: 'AI Copilot Finished Generations' },
                { key: 'inAppTeam', label: 'Workspace Invitations & Role Updates' },
                { key: 'inAppBilling', label: 'Subscription Renewals & Payment Alerts' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(prefs as any)[item.key]}
                    onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded-sm cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Push & Digest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone size={16} className="text-rose-500" /> Web Push Alerts
                </span>
                <input
                  type="checkbox"
                  checked={prefs.pushEnabled}
                  onChange={(e) => setPrefs({ ...prefs, pushEnabled: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded-sm cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-zinc-500">Browser push popups for urgent triggers.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                Email Digest Frequency
              </label>
              <select
                value={prefs.digestFrequency}
                onChange={(e) =>
                  setPrefs({ ...prefs, digestFrequency: e.target.value as any })
                }
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              >
                <option value="realtime">Real-time (Instant)</option>
                <option value="daily">Daily Summary Digest</option>
                <option value="weekly">Weekly Rollup Digest</option>
                <option value="never">Never (Mute Emails)</option>
              </select>
            </div>
          </div>

          {saveSuccess && (
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <ShieldCheck size={14} /> Preferences updated successfully!
            </p>
          )}

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
