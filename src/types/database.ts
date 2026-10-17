import { UserProfile, Customer, Task, Note, ActivityLog } from '../types';

export interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address?: string | null;
  website?: string | null;
  industry?: string | null;
  source?: string | null;
  assigned_user?: string | null;
  status: string | null;
  deal_value: number | null;
  notes: string | null;
  favorite?: boolean | null;
  archived?: boolean | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  assigned_user?: string | null;
  start_date?: string | null;
  due_date: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  labels?: string[] | null;
  subtasks?: any | null;
  recurring?: string | null;
  time_spent_seconds?: number | null;
  estimated_minutes?: number | null;
  timer_running?: boolean | null;
  timer_started_at?: string | null;
  time_logs?: any | null;
  reminders?: any | null;
  attachments?: any | null;
  comments?: any | null;
  activity_history?: any | null;
  favorite?: boolean | null;
  archived?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface NoteRow {
  id: string;
  owner_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: string;
  owner_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProfileRow, 'id'>>;
      };
      customers: {
        Row: CustomerRow;
        Insert: Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerRow, 'id' | 'owner_id'>>;
      };
      tasks: {
        Row: TaskRow;
        Insert: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TaskRow, 'id' | 'owner_id'>>;
      };
      notes: {
        Row: NoteRow;
        Insert: Omit<NoteRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NoteRow, 'id' | 'owner_id'>>;
      };
      activities: {
        Row: ActivityRow;
        Insert: Omit<ActivityRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ActivityRow, 'id' | 'owner_id'>>;
      };
    };
  };
}

// Data Mapping Utilities between DB rows (snake_case) and App Models (camelCase)

export function mapProfileRowToUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.full_name || 'User',
    email: row.email,
    businessName: row.company_name || 'My Business',
    role: (row.role as UserProfile['role']) || 'owner',
    avatarUrl: row.avatar_url || undefined,
    currency: '$',
    theme: 'light',
    createdAt: row.created_at,
  };
}

export function mapCustomerRowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    address: row.address || undefined,
    website: row.website || undefined,
    industry: row.industry || 'General',
    source: row.source || 'Direct',
    assignedUser: row.assigned_user || 'Owner',
    status: (row.status as Customer['status']) || 'lead',
    dealValue: Number(row.deal_value || 0),
    tags: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags : [row.status || 'lead'],
    notes: row.notes || '',
    favorite: Boolean(row.favorite),
    archived: Boolean(row.archived),
    lastContactDate: new Date(row.updated_at || row.created_at).toISOString().split('T')[0],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    avatarColor: 'bg-emerald-500',
  };
}

export function mapTaskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    priority: (row.priority as Task['priority']) || 'medium',
    status: (row.status as Task['status']) || 'todo',
    assignedUser: row.assigned_user || 'Owner',
    startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : undefined,
    dueDate: row.due_date ? new Date(row.due_date).toISOString().split('T')[0] : '',
    customerId: row.customer_id || undefined,
    customerName: row.customer_name || undefined,
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    tags: Array.isArray(row.labels) && row.labels.length > 0 ? row.labels : [row.priority || 'medium'],
    labels: Array.isArray(row.labels) ? row.labels : [],
    recurring: (row.recurring as Task['recurring']) || 'none',
    timeSpentSeconds: Number(row.time_spent_seconds || 0),
    estimatedMinutes: row.estimated_minutes ? Number(row.estimated_minutes) : undefined,
    timerRunning: Boolean(row.timer_running),
    timerStartedAt: row.timer_started_at || undefined,
    timeLogs: Array.isArray(row.time_logs) ? row.time_logs : [],
    reminders: Array.isArray(row.reminders) ? row.reminders : [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    comments: Array.isArray(row.comments) ? row.comments : [],
    activityHistory: Array.isArray(row.activity_history) ? row.activity_history : [],
    favorite: Boolean(row.favorite),
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNoteRowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    category: 'General',
    pinned: false,
    tags: ['Note'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapActivityRowToActivity(row: ActivityRow): ActivityLog {
  return {
    id: row.id,
    type: (row.activity_type as ActivityLog['type']) || 'system',
    title: row.activity_type.toUpperCase(),
    description: row.description,
    timestamp: row.created_at,
  };
}
