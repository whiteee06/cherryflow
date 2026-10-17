import React, { useState } from 'react';
import { InAppNotification } from '../../types';
import { NotificationService } from '../../services/NotificationService';
import { Bell, X, CheckCheck, Trash2, AtSign, CheckSquare, UserPlus, Sparkles } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  onNotificationsChange: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationsChange,
}) => {
  if (!isOpen) return null;

  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'mentions') return n.type === 'mention';
    return true;
  });

  const handleMarkRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    onNotificationsChange();
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    onNotificationsChange();
  };

  const handleDelete = async (id: string) => {
    await NotificationService.deleteNotification(id);
    onNotificationsChange();
  };

  const getTypeIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'mention':
        return <AtSign size={15} className="text-purple-400" />;
      case 'task_assigned':
        return <CheckSquare size={15} className="text-blue-400" />;
      case 'invite':
        return <UserPlus size={15} className="text-emerald-400" />;
      default:
        return <Sparkles size={15} className="text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 text-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">In-App Notifications</h3>
              <p className="text-xs text-zinc-400">{unreadCount} unread workspace alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-xl">
            {(['all', 'unread', 'mentions'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === f ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all relative ${
                notif.read
                  ? 'bg-zinc-800/40 border-zinc-800/60 opacity-80'
                  : 'bg-zinc-800/90 border-rose-500/40 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/60 shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {notif.title}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      )}
                    </h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      title="Mark as read"
                      className="p-1 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    title="Delete notification"
                    className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <p className="font-semibold">No notifications found.</p>
              <p className="text-[11px] mt-1">You're all caught up with workspace updates!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
