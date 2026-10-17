import React, { useState } from 'react';
import { Task, TaskPriority } from '../../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Flame } from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onOpenCreateModalWithDate: (dueDate: string) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onTaskClick,
  onOpenCreateModalWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map tasks by due date YYYY-MM-DD
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dateKey = task.dueDate.slice(0, 10);
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(task);
    }
  });

  const calendarDays = [];
  // Fill previous month trailing days
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ isCurrentMonth: false, dayNumber: null, dateStr: '' });
  }

  // Fill current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const isToday =
      new Date().getFullYear() === year &&
      new Date().getMonth() === month &&
      new Date().getDate() === day;

    calendarDays.push({
      isCurrentMonth: true,
      dayNumber: day,
      dateStr,
      isToday,
    });
  }

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'critical':
      case 'urgent':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      default:
        return 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon size={20} className="text-rose-600 dark:text-rose-400" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid of Calendar Days */}
      <div className="grid grid-cols-7 gap-1 auto-rows-fr min-h-[500px]">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="bg-zinc-50/40 dark:bg-zinc-900/20 rounded-xl p-2 min-h-[90px] border border-transparent"
              />
            );
          }

          const dayTasks = tasksByDate[cell.dateStr] || [];

          return (
            <div
              key={idx}
              onClick={() => onOpenCreateModalWithDate(cell.dateStr)}
              className={`group relative rounded-xl p-2 min-h-[90px] border transition-all flex flex-col justify-between hover:border-rose-500/40 cursor-pointer ${
                cell.isToday
                  ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30'
                  : 'bg-white dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    cell.isToday
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCreateModalWithDate(cell.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Schedule Task on this date"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Tasks List in Cell */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:scale-[1.02] transition-all ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[9px] font-bold text-zinc-400 text-center">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
