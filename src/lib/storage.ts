import { Customer, Task, Note, ActivityLog, UserProfile, BusinessOverview } from '../types';
import {
  INITIAL_USER,
  INITIAL_CUSTOMERS,
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_ACTIVITIES,
  INITIAL_BUSINESS_OVERVIEW,
} from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'cherryflow_user',
  CUSTOMERS: 'cherryflow_customers',
  TASKS: 'cherryflow_tasks',
  NOTES: 'cherryflow_notes',
  ACTIVITIES: 'cherryflow_activities',
  THEME: 'cherryflow_theme',
  AUTH: 'cherryflow_auth',
};

// Safe JSON Parse helper
function safeParse<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error loading key ${key} from storage:`, error);
    return fallback;
  }
}

// User Profile Storage
export function loadUserProfile(): UserProfile {
  return safeParse<UserProfile>(STORAGE_KEYS.USER, INITIAL_USER);
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
}

// Auth State Storage
export function loadAuthState(): boolean {
  return safeParse<boolean>(STORAGE_KEYS.AUTH, false);
}

export function saveAuthState(isAuthenticated: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  } catch (e) {
    console.error('Error saving auth state:', e);
  }
}

// Customers Storage
export function loadCustomers(): Customer[] {
  return safeParse<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Error saving customers:', e);
  }
}

// Tasks Storage
export function loadTasks(): Task[] {
  return safeParse<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

// Notes Storage
export function loadNotes(): Note[] {
  return safeParse<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving notes:', e);
  }
}

// Activity Log Storage
export function loadActivities(): ActivityLog[] {
  return safeParse<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
}

export function saveActivities(activities: ActivityLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities:', e);
  }
}

export function addActivityLog(
  type: ActivityLog['type'],
  title: string,
  description: string
): ActivityLog[] {
  const current = loadActivities();
  const newLog: ActivityLog = {
    id: `act_${Date.now()}`,
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
  };
  const updated = [newLog, ...current].slice(0, 30);
  saveActivities(updated);
  return updated;
}

// Business Metrics Dynamic Calculation (Production Mode)
export function getBusinessMetrics(customers: Customer[], tasks: Task[], notes: Note[]): BusinessOverview {
  const activeCustomers = customers.filter(c => c.status === 'active' || c.status === 'vip').length;
  const totalCustomerDealSum = customers.reduce((acc, c) => acc + (c.dealValue || 0), 0);
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    monthlyRevenue: totalCustomerDealSum,
    revenueGrowthPct: 0,
    activeCustomers,
    customerGrowthPct: 0,
    pendingTasks,
    completedTasks,
    taskCompletionRate,
    totalNotes: notes.length,
    revenueHistory: [],
  };
}

// Reset Storage to Clean Workspace
export function resetToDemoData(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(true));
  } catch (e) {
    console.error('Error clearing data:', e);
  }
}
