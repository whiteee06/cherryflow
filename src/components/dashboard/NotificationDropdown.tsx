import React, { useState } from 'react';
import { Bell, Check, Clock, Users, CheckSquare, Sparkles, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'task' | 'customer' | 'ai' | 'system';
  read: boolean;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAllAsRead,
  onClearNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'customer':
        return <Users size={14} className="text-emerald-500" />;
      case 'task':
        return <CheckSquare size={14} className="text-blue-500" />;
      case 'ai':
        return <Sparkles size={14} className="text-rose-500" />;
      default:
        return <Clock size={14} className="text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95">
          <div className="px-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Business Alerts</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 italic">No notifications at this time.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                    !item.read ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">{item.message}</p>
                      <span className="text-[9px] text-zinc-400 font-mono mt-1 block">{item.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onClearNotification(item.id)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
