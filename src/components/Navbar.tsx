import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Plus,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Building2,
  CheckSquare,
  FileText,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { ViewTab, UserProfile, ThemeMode } from '../types';
import { NotificationDropdown, NotificationItem } from './dashboard/NotificationDropdown';

interface NavbarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  user: UserProfile;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSearchModal: () => void;
  onOpenAICopilot: () => void;
  onOpenAddCustomer: () => void;
  onOpenAddTask: () => void;
  onOpenAddNote: () => void;
  onSignOut: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onClearNotification: (id: string) => void;
  onOpenNotificationDrawer?: () => void;
  unreadNotificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  onOpenSearchModal,
  onOpenAICopilot,
  onOpenAddCustomer,
  onOpenAddTask,
  onOpenAddNote,
  onSignOut,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotification,
  onOpenNotificationDrawer,
  unreadNotificationCount = 0,
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      {/* Left section: Mobile Toggle & Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white lg:hidden rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div
          onClick={onOpenSearchModal}
          className="relative w-full max-w-md hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all"
        >
          <Search size={15} className="text-zinc-400 shrink-0" />
          <span className="truncate">Search customers, tasks, or notes...</span>
          <kbd className="ml-auto hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-200 dark:bg-zinc-800 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section: Quick actions, Notifications, Theme, AI Copilot, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Copilot Button */}
        <button
          onClick={onOpenAICopilot}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-medium shadow-md shadow-rose-600/20 hover:shadow-rose-600/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <Plus size={16} className="text-rose-600 dark:text-rose-400" />
            <span className="hidden md:inline">Quick Add</span>
            <ChevronDown size={14} className="text-zinc-400" />
          </button>

          {showQuickAdd && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  onOpenAddCustomer();
                  setShowQuickAdd(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <Building2 size={15} className="text-rose-500" />
                <span>Add Customer</span>
              </button>
              <button
                onClick={() => {
                  onOpenAddTask();
                  setShowQuickAdd(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <CheckSquare size={15} className="text-rose-500" />
                <span>Create Task</span>
              </button>
              <button
                onClick={() => {
                  onOpenAddNote();
                  setShowQuickAdd(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <FileText size={15} className="text-rose-500" />
                <span>New Strategy Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        {onOpenNotificationDrawer ? (
          <button
            onClick={onOpenNotificationDrawer}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer relative"
            title="Open In-App Notifications"
          >
            <Bell size={18} />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        ) : (
          <NotificationDropdown
            notifications={notifications}
            onMarkAllAsRead={onMarkAllNotificationsRead}
            onClearNotification={onClearNotification}
          />
        )}

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white text-xs font-semibold shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {user.name}
            </span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{user.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">{user.businessName}</p>
              </div>

              <button
                onClick={() => {
                  setCurrentTab('profile');
                  setShowUserDropdown(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer mt-1"
              >
                <User size={15} className="text-zinc-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('settings');
                  setShowUserDropdown(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <Settings size={15} className="text-zinc-400" />
                <span>Account & Business Settings</span>
              </button>

              <button
                onClick={() => {
                  onSignOut();
                  setShowUserDropdown(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors cursor-pointer border-t border-zinc-100 dark:border-zinc-800/80 mt-1 pt-2"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
