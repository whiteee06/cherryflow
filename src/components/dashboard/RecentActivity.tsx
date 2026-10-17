import React from 'react';
import { ActivityLog } from '../../types';
import { Users, CheckSquare, FileText, Sparkles, Activity, Clock } from 'lucide-react';

interface RecentActivityProps {
  activities: ActivityLog[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'customer':
        return <Users size={15} className="text-emerald-500" />;
      case 'task':
        return <CheckSquare size={15} className="text-blue-500" />;
      case 'note':
        return <FileText size={15} className="text-amber-500" />;
      case 'ai':
        return <Sparkles size={15} className="text-rose-500" />;
      default:
        return <Activity size={15} className="text-zinc-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-rose-600 dark:text-rose-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Activity Stream</h3>
        </div>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
          Live Updates
        </span>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-zinc-500 italic text-center py-6">No recent activity recorded yet.</p>
        ) : (
          activities.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-xs mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
