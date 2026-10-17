import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { formatSecondsToHM } from '../../utils/timeUtils';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Edit2,
  Copy,
  Archive,
  Trash2,
  User,
  ArrowUpDown,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Flame,
  ChevronRight,
  Clock,
  Play,
  Pause,
} from 'lucide-react';

interface TaskListTableProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onPriorityChange: (id: string, newPriority: TaskPriority) => void;
  onStartTimer?: (id: string) => void;
  onStopTimer?: (id: string) => void;
}

type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'assignedUser';

export const TaskListTable: React.FC<TaskListTableProps> = ({
  tasks,
  onTaskClick,
  onEditTask,
  onDuplicateTask,
  onArchiveTask,
  onDeleteTask,
  onStatusChange,
  onPriorityChange,
  onStartTimer,
  onStopTimer,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(tasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA: any = a[sortField] || '';
    let valB: any = b[sortField] || '';

    if (sortField === 'priority') {
      const pMap: Record<string, number> = { critical: 4, urgent: 4, high: 3, medium: 2, low: 1 };
      valA = pMap[a.priority] || 0;
      valB = pMap[b.priority] || 0;
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical':
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
            <Flame size={10} /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case 'review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Review
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            To Do
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Bulk Action Header Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-rose-500/10 dark:bg-rose-950/30 px-6 py-3 border-b border-rose-500/20 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-medium">
          <span>{selectedTaskIds.length} tasks selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                selectedTaskIds.forEach((id) => onStatusChange(id, 'completed'));
                setSelectedTaskIds([]);
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              Mark Completed
            </button>
            <button
              onClick={() => {
                selectedTaskIds.forEach((id) => onArchiveTask(id));
                setSelectedTaskIds([]);
              }}
              className="px-3 py-1 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
            >
              Archive
            </button>
            <button
              onClick={() => {
                selectedTaskIds.forEach((id) => onDeleteTask(id));
                setSelectedTaskIds([]);
              }}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                  onChange={handleSelectAll}
                  className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                />
              </th>
              <th
                onClick={() => toggleSort('title')}
                className="p-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Task Title</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => toggleSort('status')}
                className="p-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => toggleSort('priority')}
                className="p-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => toggleSort('assignedUser')}
                className="p-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Assignee</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => toggleSort('dueDate')}
                className="p-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-4">Labels</th>
              <th className="p-4">Time Logged</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                  No tasks match current filter criteria.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const subtasksCompleted = (task.subtasks || []).filter((s) => s.completed).length;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`group transition-colors cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${
                      isSelected ? 'bg-rose-500/5 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Select Checkbox */}
                    <td className="p-4 text-center" onClick={(e) => handleSelectTask(task.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                      />
                    </td>

                    {/* Title & Description */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {task.title}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                              <CheckSquare size={10} /> {subtasksCompleted}/{task.subtasks.length}
                            </span>
                          )}
                        </span>
                        {task.description && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-xs">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className="bg-transparent text-xs font-semibold rounded-lg px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-rose-500 border-none cursor-pointer"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    {/* Priority Dropdown */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        onChange={(e) => onPriorityChange(task.id, e.target.value as TaskPriority)}
                        className="bg-transparent text-xs font-semibold rounded-lg px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-rose-500 border-none cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </td>

                    {/* Assignee */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-[11px]">
                          {task.assignedUser ? task.assignedUser[0].toUpperCase() : 'U'}
                        </div>
                        <span>{task.assignedUser || 'Owner'}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="p-4 text-xs text-zinc-600 dark:text-zinc-300">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-zinc-400" />
                          <span>{task.dueDate}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Labels */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(task.labels || task.tags || []).slice(0, 2).map((lbl, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          >
                            #{lbl}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Time Logged & Live Timer */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <Clock size={12} className={task.timerRunning ? 'text-rose-500 animate-spin' : 'text-zinc-400'} />
                          {formatSecondsToHM(task.timeSpentSeconds || 0)}
                        </span>

                        {onStartTimer && onStopTimer && (
                          <button
                            type="button"
                            onClick={() => {
                              if (task.timerRunning) {
                                onStopTimer(task.id);
                              } else {
                                onStartTimer(task.id);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              task.timerRunning
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={task.timerRunning ? 'Pause Timer' : 'Start Timer'}
                          >
                            {task.timerRunning ? (
                              <>
                                <Pause size={10} className="fill-current" /> Running
                              </>
                            ) : (
                              <>
                                <Play size={10} className="fill-current" /> Timer
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {activeMenuId === task.id && (
                          <div className="absolute right-0 top-6 w-44 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-20 py-1.5 text-xs text-left">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditTask(task);
                              }}
                              className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDuplicateTask(task.id);
                              }}
                              className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                              <Copy size={13} /> Duplicate
                            </button>
                            <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onArchiveTask(task.id);
                              }}
                              className="w-full text-left px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                            >
                              <Archive size={13} /> Archive
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteTask(task.id);
                              }}
                              className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
