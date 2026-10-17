import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, Customer, SubTask, TaskTimeLog } from '../../types';
import { X, CheckSquare, Sparkles, Plus, Trash2, Calendar, User, Tag, RefreshCw, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { formatSecondsToHM, formatStopwatchTime, calculateLiveTimerSeconds } from '../../utils/timeUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
  customers: Customer[];
  defaultStatus?: TaskStatus;
  defaultDueDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  customers,
  defaultStatus = 'todo',
  defaultDueDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [assignedUser, setAssignedUser] = useState('Owner');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [labels, setLabels] = useState('');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [error, setError] = useState('');

  // Time Tracking State
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerStartedAt, setTimerStartedAt] = useState<string | undefined>(undefined);
  const [timeLogs, setTimeLogs] = useState<TaskTimeLog[]>([]);
  const [liveElapsed, setLiveElapsed] = useState<number>(0);
  const [manualLogMins, setManualLogMins] = useState<string>('');
  const [manualLogNote, setManualLogNote] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setAssignedUser(task.assignedUser || 'Owner');
      setStartDate(task.startDate || '');
      setDueDate(task.dueDate || '');
      setCustomerId(task.customerId || '');
      setLabels((task.labels || task.tags || []).join(', '));
      setRecurring(task.recurring || 'none');
      setSubtasks(task.subtasks || []);
      setEstimatedMinutes(task.estimatedMinutes || '');
      setTimeSpentSeconds(task.timeSpentSeconds || 0);
      setTimerRunning(task.timerRunning || false);
      setTimerStartedAt(task.timerStartedAt);
      setTimeLogs(task.timeLogs || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus(defaultStatus);
      setAssignedUser('Owner');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate(defaultDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setCustomerId('');
      setLabels('Operations');
      setRecurring('none');
      setSubtasks([]);
      setEstimatedMinutes(60);
      setTimeSpentSeconds(0);
      setTimerRunning(false);
      setTimerStartedAt(undefined);
      setTimeLogs([]);
    }
    setError('');
  }, [task, isOpen, defaultStatus, defaultDueDate]);

  // Live timer tick
  useEffect(() => {
    if (!timerRunning || !timerStartedAt) return;
    const update = () => {
      setLiveElapsed(calculateLiveTimerSeconds(timerStartedAt, timeSpentSeconds));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerStartedAt, timeSpentSeconds]);

  if (!isOpen) return null;

  const handleAddManualSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      setError('Please provide a task title first to generate subtasks with AI.');
      return;
    }

    setIsBreakingDown(true);
    setError('');

    try {
      const res = await fetch('/api/ai/task-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title,
          description,
          priority,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        const generated: SubTask[] = data.subtasks.map((st: any, i: number) => ({
          id: `sub_ai_${Date.now()}_${i}`,
          title: st.title || 'Action step',
          completed: false,
          estimatedMinutes: st.estimatedMinutes || 30,
        }));
        setSubtasks([...subtasks, ...generated]);
      } else {
        setError('Could not generate subtasks. Please verify task title and try again.');
      }
    } catch (err: any) {
      setError(`AI breakdown error: ${err.message}`);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleStartTimer = () => {
    const nowIso = new Date().toISOString();
    setTimerRunning(true);
    setTimerStartedAt(nowIso);
  };

  const handlePauseTimer = () => {
    if (!timerStartedAt) return;
    const startMs = new Date(timerStartedAt).getTime();
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - startMs) / 1000));
    const newSpent = timeSpentSeconds + elapsedSecs;

    const newLog: TaskTimeLog = {
      id: `log_${Date.now()}`,
      durationSeconds: elapsedSecs,
      description: 'Live timer session',
      loggedAt: new Date().toISOString(),
      loggedBy: assignedUser || 'Owner',
    };

    setTimeSpentSeconds(newSpent);
    setTimerRunning(false);
    setTimerStartedAt(undefined);
    setTimeLogs([...timeLogs, newLog]);
  };

  const handleAddQuickTime = (secs: number, note: string) => {
    const newSpent = timeSpentSeconds + secs;
    const newLog: TaskTimeLog = {
      id: `log_${Date.now()}`,
      durationSeconds: secs,
      description: note,
      loggedAt: new Date().toISOString(),
      loggedBy: assignedUser || 'Owner',
    };
    setTimeSpentSeconds(newSpent);
    setTimeLogs([...timeLogs, newLog]);
  };

  const handleManualLogSubmit = () => {
    const mins = Number(manualLogMins);
    if (!mins || mins <= 0) return;
    const secs = mins * 60;
    handleAddQuickTime(secs, manualLogNote.trim() || `Manual entry (${mins} mins)`);
    setManualLogMins('');
    setManualLogNote('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const assignedCustomer = customers.find((c) => c.id === customerId);
    const labelArray = labels
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let finalSpent = timeSpentSeconds;
    let finalRunning = timerRunning;
    let finalStarted = timerStartedAt;
    let finalLogs = [...timeLogs];

    if (timerRunning && timerStartedAt) {
      const elapsed = Math.max(1, Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000));
      finalSpent += elapsed;
      finalRunning = false;
      finalStarted = undefined;
      finalLogs.push({
        id: `log_${Date.now()}`,
        durationSeconds: elapsed,
        description: 'Timer session upon save',
        loggedAt: new Date().toISOString(),
        loggedBy: assignedUser || 'Owner',
      });
    }

    onSave({
      ...(task ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignedUser: assignedUser.trim() || 'Owner',
      startDate: startDate || undefined,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      customerId: customerId || undefined,
      customerName: assignedCustomer ? assignedCustomer.company : undefined,
      labels: labelArray.length > 0 ? labelArray : ['Task'],
      tags: labelArray.length > 0 ? labelArray : ['Task'],
      recurring,
      subtasks,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      timeSpentSeconds: finalSpent,
      timerRunning: finalRunning,
      timerStartedAt: finalStarted,
      timeLogs: finalLogs,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CheckSquare size={20} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {task ? 'Edit Task Specifications' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Audit Q3 Client Deliverables & Finalize Scope"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Description & Specifications (Rich Text)
            </label>
            <textarea
              rows={3}
              placeholder="Provide complete requirements, goals, and completion criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="critical">🔥 Critical</option>
                <option value="high">🔴 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Assigned User
              </label>
              <input
                type="text"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                placeholder="Owner / Member Name"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Labels / Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Design, Client, Q3"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Recurring Schedule
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Repeat Daily</option>
                <option value="weekly">Repeat Weekly</option>
                <option value="monthly">Repeat Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Associate with CRM Customer (Optional)
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="">-- No Customer Link --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name})
                </option>
              ))}
            </select>
          </div>
          {/* Time Tracking & Live Stopwatch Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-zinc-900 dark:text-white">Time Tracking &amp; Live Timer</span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                Logged: {formatSecondsToHM(timerRunning ? liveElapsed : timeSpentSeconds)}
                {estimatedMinutes ? ` / Est: ${estimatedMinutes}m` : ''}
              </span>
            </div>

            {/* Estimated Minutes & Live Timer Control */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 60"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs"
                />
              </div>

              {/* Live Stopwatch Widget */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Stopwatch Session
                </label>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5 flex-1">
                    <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-rose-500 animate-ping' : 'bg-zinc-400'}`} />
                    <span>{formatStopwatchTime(timerRunning ? liveElapsed : timeSpentSeconds)}</span>
                  </div>

                  {!timerRunning ? (
                    <button
                      type="button"
                      onClick={handleStartTimer}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseTimer}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Pause &amp; Save</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {estimatedMinutes && Number(estimatedMinutes) > 0 && (
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Time Progress vs Estimate ({Math.round(((timerRunning ? liveElapsed : timeSpentSeconds) / (Number(estimatedMinutes) * 60)) * 100)}%)</span>
                  <span>{formatSecondsToHM(timerRunning ? liveElapsed : timeSpentSeconds)} / {estimatedMinutes}m</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      (timerRunning ? liveElapsed : timeSpentSeconds) > Number(estimatedMinutes) * 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((timerRunning ? liveElapsed : timeSpentSeconds) / (Number(estimatedMinutes) * 60)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Quick Log Buttons & Manual Time Entry */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Quick Manual Log</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddQuickTime(15 * 60, '+15 mins quick log')}
                    className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-500/20 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuickTime(30 * 60, '+30 mins quick log')}
                    className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-500/20 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuickTime(60 * 60, '+1 hour quick log')}
                    className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-500/20 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    +1h
                  </button>
                </div>
              </div>

              {/* Custom Manual Log Row */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mins (e.g. 45)"
                  value={manualLogMins}
                  onChange={(e) => setManualLogMins(e.target.value)}
                  className="w-28 px-2.5 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Session note (e.g. Client review session)..."
                  value={manualLogNote}
                  onChange={(e) => setManualLogNote(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleManualLogSubmit}
                  className="px-3 py-1 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-600 hover:text-white text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Log
                </button>
              </div>

              {/* Time Logs History */}
              {timeLogs.length > 0 && (
                <div className="pt-2 space-y-1 max-h-32 overflow-y-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Log History ({timeLogs.length})</span>
                  {timeLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-900 text-[11px] border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatSecondsToHM(log.durationSeconds)}</span>
                        <span className="text-zinc-400 truncate">{log.description || 'Session'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 shrink-0">{new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subtasks Section & AI Auto-Breakdown */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-white">Subtasks Checklist</span>
              <button
                type="button"
                onClick={handleAIBreakdown}
                disabled={isBreakingDown}
                className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles size={12} className={isBreakingDown ? 'animate-spin' : ''} />
                <span>{isBreakingDown ? 'Analyzing...' : 'AI Auto-Breakdown'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <span className="text-zinc-800 dark:text-zinc-200">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddManualSubtask}
                className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
            >
              {task ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
