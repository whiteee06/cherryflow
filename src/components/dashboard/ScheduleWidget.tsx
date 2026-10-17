import React from 'react';
import { Task } from '../../types';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, ArrowRight } from 'lucide-react';

interface ScheduleWidgetProps {
  tasks: Task[];
  onToggleTaskStatus: (id: string) => void;
  onNavigateTasks: () => void;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({
  tasks,
  onToggleTaskStatus,
  onNavigateTasks,
}) => {
  // Filter today's or high priority open tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const priorityTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    })
    .slice(0, 5);

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'medium':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Today's Focus & Schedule</h3>
          </div>
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {priorityTasks.length === 0 ? (
          <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">All caught up!</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">No pending priority tasks scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {priorityTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 hover:border-rose-300 dark:hover:border-rose-800 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    className="text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                    title="Mark complete"
                  >
                    <Circle size={18} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {task.title}
                    </p>
                    {task.customerName && (
                      <p className="text-[10px] text-zinc-500 truncate">Client: {task.customerName}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onNavigateTasks}
        className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
      >
        <span>View Full Task Board</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
