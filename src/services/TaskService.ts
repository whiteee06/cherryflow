import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';
import { Task, TaskStatus, TaskPriority, TaskComment, TaskAttachment, SubTask } from '../types';
import { TaskRow, mapTaskRowToTask } from '../types/database';
import { parseSupabaseError } from '../lib/errors';
import { loadTasks, saveTasks, addActivityLog } from '../lib/storage';

export class TaskService {
  /**
   * Fetch tasks with optional status / priority / archived filters
   */
  static async getTasks(filters?: {
    status?: string;
    priority?: string;
    includeArchived?: boolean;
    search?: string;
  }): Promise<Task[]> {
    if (!isSupabaseConfigured) {
      let list = loadTasks();
      if (!filters?.includeArchived) {
        list = list.filter(t => !t.archived);
      }
      if (filters?.status && filters.status !== 'all') {
        list = list.filter(t => t.status === filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        list = list.filter(t => t.priority === filters.priority);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          t =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.labels && t.labels.some(l => l.toLowerCase().includes(q)))
        );
      }
      return list;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        let list = loadTasks();
        if (!filters?.includeArchived) list = list.filter(t => !t.archived);
        return list;
      }

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (!filters?.includeArchived) {
        query = query.eq('archived', false);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching tasks from Supabase:', error.message);
        let list = loadTasks();
        if (!filters?.includeArchived) list = list.filter(t => !t.archived);
        return list;
      }

      let tasks = (data as TaskRow[]).map(mapTaskRowToTask);

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        tasks = tasks.filter(
          t =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.labels && t.labels.some(l => l.toLowerCase().includes(q)))
        );
      }

      saveTasks(tasks);
      return tasks;
    } catch (err) {
      console.error('TaskService.getTasks error:', parseSupabaseError(err));
      let list = loadTasks();
      if (!filters?.includeArchived) list = list.filter(t => !t.archived);
      return list;
    }
  }

  /**
   * Get single task by ID
   */
  static async getTaskById(id: string): Promise<Task | null> {
    const list = await this.getTasks({ includeArchived: true });
    return list.find(t => t.id === id) || null;
  }

  /**
   * Create a new task
   */
  static async createTask(
    input: Partial<Task> & { title: string }
  ): Promise<Task> {
    const newId = `task_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const localNew: Task = {
      id: newId,
      title: input.title,
      description: input.description || '',
      priority: (input.priority as TaskPriority) || 'medium',
      status: (input.status as TaskStatus) || 'todo',
      assignedUser: input.assignedUser || 'Owner',
      startDate: input.startDate,
      dueDate: input.dueDate || '',
      customerId: input.customerId,
      customerName: input.customerName,
      subtasks: input.subtasks || [],
      tags: input.labels || input.tags || [input.priority || 'medium'],
      labels: input.labels || input.tags || [],
      recurring: input.recurring || 'none',
      reminders: input.reminders || [],
      attachments: input.attachments || [],
      comments: input.comments || [],
      activityHistory: [
        {
          id: `act_${Date.now()}`,
          action: 'Task created',
          author: input.assignedUser || 'Owner',
          timestamp: nowIso,
        },
      ],
      favorite: false,
      archived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const currentList = loadTasks();
    const updatedList = [localNew, ...currentList];
    saveTasks(updatedList);
    addActivityLog('task', 'Task Created', `Created task: "${input.title}"`);

    if (!isSupabaseConfigured) {
      return localNew;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return localNew;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          owner_id: user.id,
          title: input.title,
          description: input.description || '',
          priority: input.priority || 'medium',
          status: input.status || 'todo',
          assigned_user: input.assignedUser || 'Owner',
          start_date: input.startDate ? new Date(input.startDate).toISOString() : null,
          due_date: input.dueDate ? new Date(input.dueDate).toISOString() : null,
          customer_id: input.customerId || null,
          customer_name: input.customerName || null,
          labels: input.labels || input.tags || [],
          subtasks: input.subtasks || [],
          recurring: input.recurring || 'none',
          reminders: input.reminders || [],
          attachments: input.attachments || [],
          comments: input.comments || [],
          activity_history: localNew.activityHistory,
          favorite: false,
          archived: false,
        })
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      const created = mapTaskRowToTask(data as TaskRow);
      const refreshedList = updatedList.map(t => (t.id === newId ? created : t));
      saveTasks(refreshedList);
      return created;
    } catch (err) {
      console.error('TaskService.createTask error:', err);
      return localNew;
    }
  }

  /**
   * Update task details
   */
  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const currentList = loadTasks();
    const existing = currentList.find(t => t.id === id);
    if (!existing) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const nowIso = new Date().toISOString();
    const newActivity = {
      id: `act_${Date.now()}`,
      action: updates.status
        ? `Status updated to ${updates.status.replace('_', ' ')}`
        : 'Task updated',
      author: updates.assignedUser || existing.assignedUser || 'Owner',
      timestamp: nowIso,
    };

    const updatedActivity = [...(existing.activityHistory || []), newActivity];

    const updatedLocal: Task = {
      ...existing,
      ...updates,
      activityHistory: updatedActivity,
      updatedAt: nowIso,
    };

    const newTasksList = currentList.map(t => (t.id === id ? updatedLocal : t));
    saveTasks(newTasksList);

    // Auto-generate next occurrence if task is completed and has a recurring schedule
    if (
      updates.status === 'completed' &&
      existing.status !== 'completed' &&
      existing.recurring &&
      existing.recurring !== 'none'
    ) {
      setTimeout(() => {
        const baseDueDate = existing.dueDate ? new Date(existing.dueDate) : new Date();
        const nextDueDate = new Date(baseDueDate);
        if (existing.recurring === 'daily') {
          nextDueDate.setDate(nextDueDate.getDate() + 1);
        } else if (existing.recurring === 'weekly') {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (existing.recurring === 'monthly') {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        let nextStartDateStr: string | undefined = undefined;
        if (existing.startDate) {
          const baseStartDate = new Date(existing.startDate);
          const nextStartDate = new Date(baseStartDate);
          if (existing.recurring === 'daily') {
            nextStartDate.setDate(nextStartDate.getDate() + 1);
          } else if (existing.recurring === 'weekly') {
            nextStartDate.setDate(nextStartDate.getDate() + 7);
          } else if (existing.recurring === 'monthly') {
            nextStartDate.setMonth(nextStartDate.getMonth() + 1);
          }
          nextStartDateStr = nextStartDate.toISOString().split('T')[0];
        }

        TaskService.createTask({
          title: existing.title,
          description: existing.description,
          priority: existing.priority,
          status: 'todo',
          assignedUser: existing.assignedUser,
          startDate: nextStartDateStr,
          dueDate: nextDueDate.toISOString().split('T')[0],
          customerId: existing.customerId,
          customerName: existing.customerName,
          labels: existing.labels || existing.tags,
          tags: existing.tags || existing.labels,
          recurring: existing.recurring,
          estimatedMinutes: existing.estimatedMinutes,
          subtasks: (existing.subtasks || []).map((st) => ({
            ...st,
            completed: false,
            id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          })),
        }).catch((err) => console.error('Error auto-generating next recurring task:', err));
      }, 0);
    }

    if (!isSupabaseConfigured) {
      return updatedLocal;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return updatedLocal;

      const dbUpdates: any = {
        updated_at: nowIso,
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.assignedUser !== undefined) dbUpdates.assigned_user = updates.assignedUser;
      if (updates.startDate !== undefined)
        dbUpdates.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : null;
      if (updates.dueDate !== undefined)
        dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
      if (updates.labels !== undefined) dbUpdates.labels = updates.labels;
      if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
      if (updates.timeSpentSeconds !== undefined) dbUpdates.time_spent_seconds = updates.timeSpentSeconds;
      if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
      if (updates.timerRunning !== undefined) dbUpdates.timer_running = updates.timerRunning;
      if (updates.timerStartedAt !== undefined) dbUpdates.timer_started_at = updates.timerStartedAt;
      if (updates.timeLogs !== undefined) dbUpdates.time_logs = updates.timeLogs;
      if (updates.reminders !== undefined) dbUpdates.reminders = updates.reminders;
      if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
      if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
      if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
      if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
      dbUpdates.activity_history = updatedActivity;

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      return mapTaskRowToTask(data as TaskRow);
    } catch (err) {
      console.error('TaskService.updateTask error:', err);
      return updatedLocal;
    }
  }

  /**
   * Start live timer for a task
   */
  static async startTaskTimer(id: string): Promise<Task> {
    const currentList = loadTasks();
    const existing = currentList.find(t => t.id === id);
    if (!existing) throw new Error(`Task ${id} not found`);

    const nowIso = new Date().toISOString();
    addActivityLog('task', 'Timer Started', `Started timer on task: "${existing.title}"`);
    return this.updateTask(id, {
      timerRunning: true,
      timerStartedAt: nowIso,
    });
  }

  /**
   * Stop / Pause live timer for a task and log elapsed duration
   */
  static async stopTaskTimer(id: string, logNote?: string): Promise<Task> {
    const currentList = loadTasks();
    const existing = currentList.find(t => t.id === id);
    if (!existing) throw new Error(`Task ${id} not found`);

    if (!existing.timerRunning || !existing.timerStartedAt) {
      return existing;
    }

    const startMs = new Date(existing.timerStartedAt).getTime();
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - startMs) / 1000));
    const previousTimeSpent = existing.timeSpentSeconds || 0;
    const newTotalSpent = previousTimeSpent + elapsedSecs;

    const newLog = {
      id: `log_${Date.now()}`,
      durationSeconds: elapsedSecs,
      description: logNote || 'Live timer session',
      loggedAt: new Date().toISOString(),
      loggedBy: existing.assignedUser || 'Owner',
    };

    const updatedLogs = [...(existing.timeLogs || []), newLog];
    addActivityLog('task', 'Timer Stopped', `Logged ${Math.round(elapsedSecs / 60)} mins on task: "${existing.title}"`);

    return this.updateTask(id, {
      timerRunning: false,
      timerStartedAt: undefined,
      timeSpentSeconds: newTotalSpent,
      timeLogs: updatedLogs,
    });
  }

  /**
   * Add manual time log entry to task
   */
  static async logManualTime(id: string, durationSeconds: number, note?: string): Promise<Task> {
    const currentList = loadTasks();
    const existing = currentList.find(t => t.id === id);
    if (!existing) throw new Error(`Task ${id} not found`);

    const previousTimeSpent = existing.timeSpentSeconds || 0;
    const newTotalSpent = previousTimeSpent + durationSeconds;

    const newLog = {
      id: `log_${Date.now()}`,
      durationSeconds,
      description: note || 'Manual time entry',
      loggedAt: new Date().toISOString(),
      loggedBy: existing.assignedUser || 'Owner',
    };

    const updatedLogs = [...(existing.timeLogs || []), newLog];
    addActivityLog('task', 'Time Logged', `Manually logged time on task: "${existing.title}"`);

    return this.updateTask(id, {
      timeSpentSeconds: newTotalSpent,
      timeLogs: updatedLogs,
    });
  }

  /**
   * Duplicate a task
   */
  static async duplicateTask(id: string): Promise<Task | null> {
    const existing = await this.getTaskById(id);
    if (!existing) return null;

    const duplicated = await this.createTask({
      title: `${existing.title} (Copy)`,
      description: existing.description,
      priority: existing.priority,
      status: existing.status,
      assignedUser: existing.assignedUser,
      startDate: existing.startDate,
      dueDate: existing.dueDate,
      customerId: existing.customerId,
      customerName: existing.customerName,
      subtasks: existing.subtasks.map(s => ({ ...s, id: `sub_${Date.now()}_${Math.random()}` })),
      labels: existing.labels || existing.tags,
      recurring: existing.recurring,
      reminders: existing.reminders,
    });

    addActivityLog('task', 'Task Duplicated', `Duplicated task "${existing.title}"`);
    return duplicated;
  }

  /**
   * Archive a task
   */
  static async archiveTask(id: string): Promise<Task> {
    const updated = await this.updateTask(id, { archived: true, status: 'archived' });
    addActivityLog('task', 'Task Archived', `Archived task "${updated.title}"`);
    return updated;
  }

  /**
   * Restore an archived task
   */
  static async restoreTask(id: string): Promise<Task> {
    const updated = await this.updateTask(id, { archived: false, status: 'todo' });
    addActivityLog('task', 'Task Restored', `Restored task "${updated.title}"`);
    return updated;
  }

  /**
   * Toggle completion status
   */
  static async toggleTaskStatus(id: string, currentStatus: TaskStatus): Promise<Task> {
    const nextStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    const updated = await this.updateTask(id, { status: nextStatus });
    addActivityLog(
      'task',
      'Task Status Changed',
      `Marked "${updated.title}" as ${nextStatus.replace('_', ' ')}`
    );
    return updated;
  }

  /**
   * Delete a task permanently
   */
  static async deleteTask(id: string): Promise<boolean> {
    const currentList = loadTasks();
    const task = currentList.find(t => t.id === id);
    const updatedList = currentList.filter(t => t.id !== id);
    saveTasks(updatedList);

    if (task) {
      addActivityLog('task', 'Task Deleted', `Deleted task "${task.title}"`);
    }

    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return true;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) {
        throw parseSupabaseError(error);
      }

      return true;
    } catch (err) {
      console.error('TaskService.deleteTask error:', err);
      return true;
    }
  }

  /**
   * Add a comment to a task
   */
  static async addComment(id: string, text: string, authorName: string): Promise<Task> {
    const existing = await this.getTaskById(id);
    if (!existing) throw new Error('Task not found');

    const newComment: TaskComment = {
      id: `comment_${Date.now()}`,
      author: authorName || 'Owner',
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(existing.comments || []), newComment];
    return this.updateTask(id, { comments: updatedComments });
  }

  /**
   * Upload and attach a file to a task
   */
  static async addAttachment(id: string, file: File): Promise<TaskAttachment> {
    const existing = await this.getTaskById(id);
    if (!existing) throw new Error('Task not found');

    let fileUrl = '';
    const fileId = `att_${Date.now()}`;

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${id}/${fileId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(filePath);
          fileUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload failed, falling back to local object URL:', err);
      }
    }

    if (!fileUrl) {
      fileUrl = URL.createObjectURL(file);
    }

    const attachment: TaskAttachment = {
      id: fileId,
      name: file.name,
      url: fileUrl,
      sizeBytes: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    const updatedAttachments = [...(existing.attachments || []), attachment];
    await this.updateTask(id, { attachments: updatedAttachments });
    return attachment;
  }

  /**
   * Realtime Subscription Listener for Tasks
   */
  static subscribeToTaskChanges(onChange: () => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
