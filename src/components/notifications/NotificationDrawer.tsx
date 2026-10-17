import React, { useState } from 'react';
import { AppNotification, NotificationCategory } from '../../types';
import { NotificationService } from '../../services/NotificationService';
import {
  X,
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Sparkles,
  Users,
  CheckSquare,
  CreditCard,
  Briefcase,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNotificationsUpdated: () => void;
  onOpenPreferences: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationsUpdated,
  onOpenPreferences,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterUnread, setFilterUnread] = useState(false);

  const filtered = notifications.filter((n) => {
    if (filterUnread && n.read) return false;
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    onNotificationsUpdated();
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    onNotificationsUpdated();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await NotificationService.deleteNotification(id);
    onNotificationsUpdated();
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'crm':
        return <Briefcase size={14} className="text-rose-500" />;
      case 'tasks':
        return <CheckSquare size={14} className="text-blue-500" />;
      case 'ai':
        return <Sparkles size={14} className="text-purple-500" />;
      case 'team':
        return <Users size={14} className="text-emerald-500" />;
      case 'billing':
        return <CreditCard size={14} className="text-amber-500" />;
      default:
        return <Bell size={14} className="text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">In-App Notifications</h3>
                <p className="text-xs text-zinc-500">{unreadCount} unread messages</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenPreferences}
                title="Notification Settings"
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-all"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {['all', 'crm', 'tasks', 'ai', 'team', 'billing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterUnread
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Unread
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 space-y-2">
                <Bell size={32} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-semibold">No notifications match your filter</p>
                <p className="text-xs">You are all caught up!</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    !item.read
                      ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 shadow-2xs'
                      : 'bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete Notification"
                      className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>

            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('notifications');
                onClose();
              }}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer flex items-center gap-1"
            >
              <span>View History</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
