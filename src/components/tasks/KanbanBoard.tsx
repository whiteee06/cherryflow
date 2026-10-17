import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { formatSecondsToHM } from '../../utils/timeUtils';
import {
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  Trash2,
  CheckCircle2,
  Paperclip,
  MessageSquare,
  CheckSquare,
  User,
  Plus,
  Flame,
  ArrowRight,
  Play,
  Pause,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onOpenCreateModal: (defaultStatus?: TaskStatus) => void;
  onStartTimer?: (id: string) => void;
  onStopTimer?: (id: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; dotBg: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-zinc-300 dark:border-zinc-700', dotBg: 'bg-zinc-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-400 dark:border-blue-600', dotBg: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'border-amber-400 dark:border-amber-600', dotBg: 'bg-amber-500' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-400 dark:border-emerald-600', dotBg: 'bg-emerald-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onEditTask,
  onDuplicateTask,
  onArchiveTask,
  onDeleteTask,
  onStatusChange,
  onOpenCreateModal,
  onStartTimer,
  onStopTimer,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical':
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <Flame size={10} /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            Low
          </span>
        );
    }
  };

  const isOverdue = (dueDateStr?: string, status?: TaskStatus) => {
    if (!dueDateStr || status === 'completed' || status === 'archived') return false;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isDueSoon = (dueDateStr?: string, status?: TaskStatus) => {
    if (!dueDateStr || status === 'completed' || status === 'archived') return false;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    return due >= today && due <= in3Days;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onStatusChange(taskId, newStatus);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 min-h-[600px] overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isTarget = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl p-4 transition-all border ${
              isTarget
                ? 'bg-rose-500/5 border-rose-500/40 ring-2 ring-rose-500/20'
                : 'bg-zinc-100/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotBg}`} />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal(col.id)}
                className="p-1 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-zinc-800 transition"
                title="Add Task to column"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Task Cards Stack */}
            <div className="flex-1 space-y-3 min-h-[200px]">
              {colTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800/60 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs">
                  <span>No tasks</span>
                  <button
                    onClick={() => onOpenCreateModal(col.id)}
                    className="mt-2 text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Task
                  </button>
                </div>
              ) : (
                colTasks.map((task) => {
                  const subtasksCompleted = (task.subtasks || []).filter((s) => s.completed).length;
                  const totalSubtasks = (task.subtasks || []).length;
                  const overdue = isOverdue(task.dueDate, task.status);
                  const dueSoon = isDueSoon(task.dueDate, task.status);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                      className="group relative bg-white dark:bg-zinc-900/90 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all cursor-pointer hover:border-rose-500/30"
                    >
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getPriorityBadge(task.priority)}
                          {task.recurring && task.recurring !== 'none' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium capitalize">
                              ↻ {task.recurring}
                            </span>
                          )}
                        </div>

                        {/* Card Context Menu Toggle */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {activeMenuId === task.id && (
                            <div className="absolute right-0 top-6 w-44 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-20 py-1.5 text-xs">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onEditTask(task);
                                }}
                                className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <Edit2 size={13} /> Edit Task
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDuplicateTask(task.id);
                                }}
                                className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <Copy size={13} /> Duplicate Task
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onStatusChange(
                                    task.id,
                                    task.status === 'completed' ? 'todo' : 'completed'
                                  );
                                }}
                                className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <CheckCircle2 size={13} />
                                {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                              </button>

                              <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onArchiveTask(task.id);
                                }}
                                className="w-full text-left px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                              >
                                <Archive size={13} /> Archive Task
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteTask(task.id);
                                }}
                                className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                              >
                                <Trash2 size={13} /> Delete Task
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-1 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Description Preview */}
                      {task.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.labels.slice(0, 3).map((lbl, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            >
                              #{lbl}
                            </span>
                          ))}
                          {task.labels.length > 3 && (
                            <span className="text-[10px] text-zinc-400">
                              +{task.labels.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtasks Progress */}
                      {totalSubtasks > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                            <span className="flex items-center gap-1">
                              <CheckSquare size={12} /> Subtasks
                            </span>
                            <span>
                              {subtasksCompleted}/{totalSubtasks}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-300"
                              style={{ width: `${(subtasksCompleted / totalSubtasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Timer & Time Logged Indicator */}
                      <div className="flex items-center justify-between mb-2 p-1.5 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-[11px]">
                        <div className="flex items-center gap-1.5 font-mono text-zinc-700 dark:text-zinc-300">
                          <Clock size={12} className={task.timerRunning ? 'text-rose-500 animate-spin' : 'text-zinc-400'} />
                          <span className="font-bold">
                            {formatSecondsToHM(task.timeSpentSeconds || 0)}
                          </span>
                          {task.estimatedMinutes ? (
                            <span className="text-[10px] text-zinc-400">/ {task.estimatedMinutes}m</span>
                          ) : null}
                        </div>

                        {/* Quick Start / Stop Button */}
                        {onStartTimer && onStopTimer && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
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

                      {/* Footer Info: User Avatar, Due Date, Indicators */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                        {/* Assignee */}
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                          <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">
                            {task.assignedUser ? task.assignedUser[0].toUpperCase() : 'U'}
                          </div>
                          <span className="text-[11px] truncate max-w-[80px]">
                            {task.assignedUser || 'Owner'}
                          </span>
                        </div>

                        {/* Due Date & Counters */}
                        <div className="flex items-center gap-2">
                          {task.attachments && task.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-zinc-400 text-[11px]">
                              <Paperclip size={11} /> {task.attachments.length}
                            </span>
                          )}
                          {task.comments && task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-zinc-400 text-[11px]">
                              <MessageSquare size={11} /> {task.comments.length}
                            </span>
                          )}

                          {task.dueDate && (
                            <div
                              className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
                                overdue
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                                  : dueSoon
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                                  : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              <Calendar size={11} />
                              <span>{task.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
