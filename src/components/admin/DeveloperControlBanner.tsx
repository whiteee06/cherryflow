import React, { useState } from 'react';
import { SuperAdminService } from '../../services/superAdminService';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Database,
  Sliders,
  LogOut,
  Sparkles,
  Terminal,
  Activity,
  AlertTriangle,
  ChevronDown,
  Check,
} from 'lucide-react';
import { ViewTab, UserProfile } from '../../types';

interface DeveloperControlBannerProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  impersonatedUser: UserProfile | null;
  onStopImpersonation: () => void;
  onSignOutSuperAdmin: () => void;
}

export const DeveloperControlBanner: React.FC<DeveloperControlBannerProps> = ({
  currentTab,
  setCurrentTab,
  impersonatedUser,
  onStopImpersonation,
  onSignOutSuperAdmin,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <div className="bg-gradient-to-r from-rose-950 via-zinc-900 to-rose-950 border-b border-rose-600/40 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg z-40 sticky top-0">
      {/* Left: Identity Badge & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-extrabold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg">
          <ShieldCheck size={14} className="animate-pulse text-rose-400" />
          <span>DEVELOPER ROOT MODE</span>
        </div>

        <span className="hidden sm:inline-block text-zinc-300 font-mono text-[11px]">
          User: <strong className="text-white">cherry_06</strong> (Root Developer Admin)
        </span>

        {impersonatedUser && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-[11px]">
            <AlertTriangle size={12} />
            <span>Impersonating: {impersonatedUser.name} ({impersonatedUser.email})</span>
            <button
              onClick={onStopImpersonation}
              className="ml-1 px-1.5 py-0.2 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentTab('admin')}
          className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
            currentTab === 'admin'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
          }`}
        >
          <ShieldCheck size={13} />
          <span>Super Admin Control Center</span>
        </button>

        {/* Quick Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Sliders size={13} />
            <span className="hidden md:inline">Root Controls</span>
            <ChevronDown size={12} />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1.5 z-50 text-xs text-zinc-200">
              <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-zinc-400 border-b border-zinc-800">
                Developer Root Tools
              </div>

              <button
                onClick={() => {
                  setCurrentTab('admin');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center gap-2 text-rose-400 font-semibold"
              >
                <ShieldCheck size={14} /> Full Control Dashboard
              </button>

              <button
                onClick={() => {
                  setCurrentTab('customers');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center gap-2"
              >
                <Users size={14} /> View All CRM Accounts
              </button>

              <button
                onClick={() => {
                  setCurrentTab('billing');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center gap-2"
              >
                <Database size={14} /> Subscriptions & Billing
              </button>

              <button
                onClick={() => {
                  setCurrentTab('settings');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center gap-2"
              >
                <Sliders size={14} /> System & Workspace Settings
              </button>

              <div className="border-t border-zinc-800 my-1" />

              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onSignOutSuperAdmin();
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 font-semibold"
              >
                <LogOut size={14} /> Exit Super Admin Mode
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onSignOutSuperAdmin}
          className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
          title="Exit Super Admin Mode"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
};
