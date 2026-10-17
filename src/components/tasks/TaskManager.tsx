import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, Customer } from '../../types';
import { TaskService } from '../../services/TaskService';
import { KanbanBoard } from './KanbanBoard';
import { TaskListTable } from './TaskListTable';
import { TaskCalendarView } from './TaskCalendarView';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskModal } from './TaskModal';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  Bell,
  Archive,
  RefreshCw,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  customers: Customer[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefreshTasks: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  customers,
  searchQuery,
  setSearchQuery,
  onRefreshTasks,
}) => {
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar' | 'archived'>('kanban');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Drawers & Modals State
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('todo');
  const [modalDefaultDueDate, setModalDefaultDueDate] = useState<string | undefined>(undefined);

  // Subscribe to Realtime DB Changes
  useEffect(() => {
    const unsubscribe = TaskService.subscribeToTaskChanges(() => {
      onRefreshTasks();
    });
    return () => {
      unsubscribe();
    };
  }, [onRefreshTasks]);

  // Calculations for Notifications & Banners
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const activeTasks = tasks.filter((t) => !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);

  const overdueTasks = activeTasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    const due = new Date(t.dueDate);
    return due < today;
  });

  const dueSoonTasks = activeTasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    const due = new Date(t.dueDate);
    return due >= today && due <= in3Days;
  });

  const completedCount = activeTasks.filter((t) => t.status === 'completed').length;

  // Filter tasks based on view mode and criteria
  const displayedTasks = (activeView === 'archived' ? archivedTasks : activeTasks).filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.labels && t.labels.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Task Action Handlers
  const handleOpenCreateModal = (defaultStatus: TaskStatus = 'todo', defaultDueDate?: string) => {
    setTaskToEdit(null);
    setModalDefaultStatus(defaultStatus);
    setModalDefaultDueDate(defaultDueDate);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleOpenTaskDrawer = (task: Task) => {
    setSelectedTaskForDrawer(task);
    setIsDrawerOpen(true);
  };

  const handleStartTimer = async (id: string) => {
    await TaskService.startTaskTimer(id);
    onRefreshTasks();
    if (selectedTaskForDrawer?.id === id) {
      const updated = await TaskService.getTaskById(id);
      if (updated) setSelectedTaskForDrawer(updated);
    }
  };

  const handleStopTimer = async (id: string) => {
    await TaskService.stopTaskTimer(id);
    onRefreshTasks();
    if (selectedTaskForDrawer?.id === id) {
      const updated = await TaskService.getTaskById(id);
      if (updated) setSelectedTaskForDrawer(updated);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskToEdit) {
      await TaskService.updateTask(taskToEdit.id, taskData);
    } else {
      await TaskService.createTask(taskData as any);
    }
    onRefreshTasks();
    setIsModalOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    await TaskService.updateTask(id, { status: newStatus });
    onRefreshTasks();
    if (selectedTaskForDrawer?.id === id) {
      setSelectedTaskForDrawer((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handlePriorityChange = async (id: string, newPriority: TaskPriority) => {
    await TaskService.updateTask(id, { priority: newPriority });
    onRefreshTasks();
    if (selectedTaskForDrawer?.id === id) {
      setSelectedTaskForDrawer((prev) => (prev ? { ...prev, priority: newPriority } : null));
    }
  };

  const handleDuplicateTask = async (id: string) => {
    await TaskService.duplicateTask(id);
    onRefreshTasks();
  };

  const handleArchiveTask = async (id: string) => {
    await TaskService.archiveTask(id);
    onRefreshTasks();
    if (selectedTaskForDrawer?.id === id) {
      setIsDrawerOpen(false);
    }
  };

  const handleRestoreTask = async (id: string) => {
    await TaskService.restoreTask(id);
    onRefreshTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task permanently?')) {
      await TaskService.deleteTask(id);
      onRefreshTasks();
      if (selectedTaskForDrawer?.id === id) {
        setIsDrawerOpen(false);
      }
    }
  };

  const handleUpdateTaskFromDrawer = async (id: string, updates: Partial<Task>) => {
    const updated = await TaskService.updateTask(id, updates);
    setSelectedTaskForDrawer(updated);
    onRefreshTasks();
    return updated;
  };

  const handleAddCommentFromDrawer = async (id: string, text: string) => {
    const updated = await TaskService.addComment(id, text, 'Owner');
    setSelectedTaskForDrawer(updated);
    onRefreshTasks();
    return updated;
  };

  const handleAddAttachmentFromDrawer = async (id: string, file: File) => {
    const attachment = await TaskService.addAttachment(id, file);
    const updated = await TaskService.getTaskById(id);
    if (updated) setSelectedTaskForDrawer(updated);
    onRefreshTasks();
    return attachment;
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare size={24} className="text-rose-600 dark:text-rose-400" />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Task & Project Hub
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Organize work, track deliverables, drag-and-drop workflow statuses, and collaborate with real-time updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* Notification Alerts Banners */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueTasks.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">Overdue Tasks ({overdueTasks.length})</span>
                  <p className="text-[11px] opacity-80">
                    "{overdueTasks[0].title}" requires immediate attention.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                }}
                className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-xl text-[11px] hover:bg-rose-700 transition"
              >
                Review
              </button>
            </div>
          )}

          {dueSoonTasks.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Due Soon ({dueSoonTasks.length})</span>
                  <p className="text-[11px] opacity-80">
                    "{dueSoonTasks[0].title}" is due in the next 3 days.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                }}
                className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-xl text-[11px] hover:bg-amber-700 transition"
              >
                View
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation, Search, and Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: View Modes Switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl w-full lg:w-auto overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'kanban'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid size={15} /> Kanban Board
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'list'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ListIcon size={15} /> List View
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'calendar'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={15} /> Calendar
          </button>
          <button
            onClick={() => setActiveView('archived')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'archived'
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Archive size={15} /> Archived ({archivedTasks.length})
          </button>
        </div>

        {/* Right: Search Input & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks, labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          {activeView !== 'archived' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Views Render */}
      {activeView === 'kanban' && (
        <KanbanBoard
          tasks={displayedTasks}
          onTaskClick={handleOpenTaskDrawer}
          onEditTask={handleOpenEditModal}
          onDuplicateTask={handleDuplicateTask}
          onArchiveTask={handleArchiveTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onOpenCreateModal={handleOpenCreateModal}
          onStartTimer={handleStartTimer}
          onStopTimer={handleStopTimer}
        />
      )}

      {activeView === 'list' && (
        <TaskListTable
          tasks={displayedTasks}
          onTaskClick={handleOpenTaskDrawer}
          onEditTask={handleOpenEditModal}
          onDuplicateTask={handleDuplicateTask}
          onArchiveTask={handleArchiveTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onStartTimer={handleStartTimer}
          onStopTimer={handleStopTimer}
        />
      )}

      {activeView === 'calendar' && (
        <TaskCalendarView
          tasks={displayedTasks}
          onTaskClick={handleOpenTaskDrawer}
          onOpenCreateModalWithDate={(d) => handleOpenCreateModal('todo', d)}
        />
      )}

      {activeView === 'archived' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Archive size={18} className="text-amber-500" /> Archived Tasks ({displayedTasks.length})
          </h3>
          {displayedTasks.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">No archived tasks found.</p>
          ) : (
            <div className="space-y-3">
              {displayedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">{t.title}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Archived • Priority: {t.priority}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreTask(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-600/20 transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-rose-500 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTaskForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateTask={handleUpdateTaskFromDrawer}
        onAddComment={handleAddCommentFromDrawer}
        onAddAttachment={handleAddAttachmentFromDrawer}
        onDeleteTask={handleDeleteTask}
        onDuplicateTask={handleDuplicateTask}
        onArchiveTask={handleArchiveTask}
      />

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={taskToEdit}
        customers={customers}
        defaultStatus={modalDefaultStatus}
        defaultDueDate={modalDefaultDueDate}
      />
    </div>
  );
};
