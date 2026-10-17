import { Customer, Task, Note, ActivityLog, BusinessOverview, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_owner_default',
  name: 'Workspace Owner',
  email: 'owner@cherryflow.io',
  businessName: 'My Workspace',
  role: 'owner',
  currency: '$',
  theme: 'dark',
  createdAt: new Date().toISOString(),
};

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_NOTES: Note[] = [];

export const INITIAL_ACTIVITIES: ActivityLog[] = [];

export const INITIAL_BUSINESS_OVERVIEW: BusinessOverview = {
  monthlyRevenue: 0,
  revenueGrowthPct: 0,
  activeCustomers: 0,
  customerGrowthPct: 0,
  pendingTasks: 0,
  completedTasks: 0,
  taskCompletionRate: 0,
  totalNotes: 0,
  revenueHistory: [],
};
