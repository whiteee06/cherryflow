import React from 'react';
import { CherryFlowLogo } from './common/CherryFlowLogo';
import { BRAND_CONFIG } from '../config/brandConfig';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileText,
  BarChart3,
  Sparkles,
  User,
  Settings,
  LogOut,
  Flame,
  Zap,
  TrendingUp,
  X,
  Building2,
  CreditCard,
  Globe,
  ShieldCheck,
  Info,
  MessageSquare,
} from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  customerCount: number;
  pendingTaskCount: number;
  noteCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  customerCount,
  pendingTaskCount,
  noteCount,
  isOpenMobile,
  setIsOpenMobile,
  onSignOut,
}) => {
  const navItems = [
    {
      id: 'landing' as ViewTab,
      label: 'Landing Page',
      icon: Globe,
      badge: 'SAAS',
      badgeColor: 'bg-rose-500/20 text-rose-500 font-bold',
    },
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customers' as ViewTab,
      label: 'Customers CRM',
      icon: Users,
      badge: customerCount,
    },
    {
      id: 'tasks' as ViewTab,
      label: 'Task Manager',
      icon: CheckSquare,
      badge: pendingTaskCount > 0 ? `${pendingTaskCount} pending` : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    },
    {
      id: 'notes' as ViewTab,
      label: 'Notes & Strategy',
      icon: FileText,
      badge: noteCount,
    },
    {
      id: 'analytics' as ViewTab,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'team' as ViewTab,
      label: 'Team Workspace',
      icon: Building2,
    },
    {
      id: 'automations' as ViewTab,
      label: 'Automations',
      icon: Zap,
      badge: 'AUTO',
      badgeColor: 'bg-amber-500/20 text-amber-500 font-bold',
    },
    {
      id: 'settings' as ViewTab,
      label: 'Settings',
      icon: Settings,
    },
    {
      id: 'feedback' as ViewTab,
      label: 'Feedback & Support',
      icon: MessageSquare,
      badge: 'NEW',
      badgeColor: 'bg-rose-500/20 text-rose-500 font-bold',
    },
    {
      id: 'about' as ViewTab,
      label: 'About CherryFlow',
      icon: Info,
      badge: 'v1.0',
      badgeColor: 'bg-rose-500/10 text-rose-400 font-mono',
    },
    {
      id: 'admin' as ViewTab,
      label: 'Super Admin',
      icon: ShieldCheck,
      badge: 'ROOT',
      badgeColor: 'bg-rose-600 text-white font-extrabold shadow-sm',
    },
  ];

  const handleSelect = (tab: ViewTab) => {
    setCurrentTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Top Brand Logo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80">
            <CherryFlowLogo
              size="md"
              showSubtitle={true}
              onClick={() => handleSelect('dashboard')}
            />

            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-white' : 'text-zinc-400'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-rose-700 text-white' : 'bg-zinc-800 text-zinc-400')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Banner & Logout */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-800/90 to-zinc-900 border border-zinc-700/50 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <Zap size={15} className="fill-emerald-400/20" />
              <span className="text-xs font-semibold text-white">100% Free & Unlimited</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-1">
              All CRM, task boards, team management, and workspace features are free for all users.
            </p>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
