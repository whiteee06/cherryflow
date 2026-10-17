import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Shield,
  Mail,
  Palette,
  HardDrive,
  Key,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  Power,
} from 'lucide-react';
import { FeatureFlag, SystemSetting } from '../../types/admin';

interface AdminSettingsTabProps {
  featureFlags: FeatureFlag[];
  systemSettings: SystemSetting[];
  isMaintenanceMode: boolean;
  onToggleFeatureFlag: (flagId: string) => void;
  onToggleMaintenanceMode: () => void;
  onUpdateSystemSetting: (key: string, value: string) => void;
  onCreateFeatureFlag: (flag: Omit<FeatureFlag, 'id' | 'updatedAt'>) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  featureFlags,
  systemSettings,
  isMaintenanceMode,
  onToggleFeatureFlag,
  onToggleMaintenanceMode,
  onUpdateSystemSetting,
  onCreateFeatureFlag,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  // New Feature Flag State
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagKey, setNewFlagKey] = useState('');
  const [newFlagCategory, setNewFlagCategory] = useState<'ai' | 'billing' | 'core' | 'beta'>('beta');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [showAddFlagModal, setShowAddFlagModal] = useState(false);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const getSettingValue = (key: string) => {
    const s = systemSettings.find((x) => x.key === key);
    return s ? s.value : '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      {/* Global Maintenance Mode Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Power className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Platform Maintenance Mode Guard
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            When enabled, non-super-admin users attempting to log in or use workspace APIs will see the System Maintenance Screen.
          </p>
        </div>

        <button
          onClick={() => {
            onToggleMaintenanceMode();
            triggerNotice(
              isMaintenanceMode ? 'Deactivated System Maintenance Mode' : 'ACTIVATED System Maintenance Mode'
            );
          }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            isMaintenanceMode
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          {isMaintenanceMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{isMaintenanceMode ? 'Maintenance: ACTIVE' : 'Maintenance: OFF'}</span>
        </button>
      </div>

      {/* Feature Flags Manager */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-rose-500" />
              <span>Feature Flags Governance ({featureFlags.length} Flags)</span>
            </h3>
            <p className="text-xs text-zinc-500">Toggle live features without deploying code builds</p>
          </div>

          <button
            onClick={() => setShowAddFlagModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Feature Flag</span>
          </button>
        </div>

        <div className="space-y-3">
          {featureFlags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">{flag.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                    {flag.key}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold uppercase text-[9px]">
                    {flag.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{flag.description}</p>
              </div>

              <button
                onClick={() => {
                  onToggleFeatureFlag(flag.id);
                  triggerNotice(`Toggled flag '${flag.name}' to ${!flag.enabled}`);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                  flag.enabled
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                {flag.enabled ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                <span>{flag.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Branding & SMTP Config Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-rose-500" />
          <span>Global Application Branding &amp; SMTP Relay</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Platform Brand Name
            </label>
            <input
              type="text"
              value={getSettingValue('app_name')}
              onChange={(e) => onUpdateSystemSetting('app_name', e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Primary Accent Hex Color
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={getSettingValue('brand_color_primary')}
                onChange={(e) => onUpdateSystemSetting('brand_color_primary', e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-rose-500"
              />
              <div
                style={{ backgroundColor: getSettingValue('brand_color_primary') || '#e11d48' }}
                className="w-11 h-11 rounded-xl border border-zinc-300 dark:border-zinc-700 flex-shrink-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Outbound SMTP Server Host
            </label>
            <input
              type="text"
              value={getSettingValue('smtp_host')}
              onChange={(e) => onUpdateSystemSetting('smtp_host', e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Admin Inactivity Session Timeout (Minutes)
            </label>
            <input
              type="number"
              value={getSettingValue('admin_session_timeout_minutes')}
              onChange={(e) => onUpdateSystemSetting('admin_session_timeout_minutes', e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => triggerNotice('Successfully persisted global system settings!')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Save System Settings
          </button>
        </div>
      </div>

      {/* Modal for Creating Feature Flag */}
      {showAddFlagModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Create New Feature Flag</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Feature Name *
              </label>
              <input
                type="text"
                required
                value={newFlagName}
                onChange={(e) => {
                  setNewFlagName(e.target.value);
                  setNewFlagKey(
                    'enable_' +
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '_')
                        .replace(/_+/g, '_')
                  );
                }}
                placeholder="e.g. Realtime Whiteboard Canvas"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Feature Key (Auto-generated) *
              </label>
              <input
                type="text"
                readOnly
                value={newFlagKey}
                className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={newFlagCategory}
                onChange={(e) => setNewFlagCategory(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="core">Core Platform</option>
                <option value="ai">AI Copilot</option>
                <option value="billing">Billing &amp; Stripe</option>
                <option value="beta">Beta Feature</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={newFlagDesc}
                onChange={(e) => setNewFlagDesc(e.target.value)}
                placeholder="Brief description of what this feature flag controls..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddFlagModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFlagName && newFlagKey) {
                    onCreateFeatureFlag({
                      name: newFlagName,
                      key: newFlagKey,
                      category: newFlagCategory,
                      description: newFlagDesc || 'Custom feature flag',
                      enabled: true,
                    });
                    triggerNotice(`Created feature flag ${newFlagName}`);
                    setShowAddFlagModal(false);
                    setNewFlagName('');
                    setNewFlagKey('');
                    setNewFlagDesc('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Create Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
