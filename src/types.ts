export type ThemeMode = 'light' | 'dark';

export type UserRole = 'owner' | 'admin' | 'member' | 'super_admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  role: UserRole | string;
  avatarUrl?: string;
  currency: string; // e.g. '$'
  theme: ThemeMode;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  mustChangePassword?: boolean;
  firstLoginCompleted?: boolean;
  tempPassword?: string;
  defaultWorkspaceId?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  emailVerificationPending: boolean;
  pendingVerificationEmail?: string;
  error: string | null;
}

export type AuthScreen =
  | 'landing'
  | 'login'
  | 'register'
  | 'accept_invitation'
  | 'force_password_change'
  | 'forgot_password'
  | 'reset_password'
  | 'verify_email'
  | 'setup_guide'
  | 'super_admin_login'
  | 'super_admin_app'
  | 'unauthorized'
  | 'app';

export type CustomerStatus = 'lead' | 'prospect' | 'proposal' | 'active' | 'vip' | 'won' | 'inactive';

export type CustomerSource = 'Inbound' | 'Referral' | 'Outreach' | 'Website' | 'Event' | 'Partner' | 'Direct';

export interface CustomerTimelineEvent {
  id: string;
  customerId: string;
  eventType: 'note' | 'status_change' | 'email' | 'call' | 'created' | 'deal_update';
  title: string;
  description?: string;
  author?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
  website?: string;
  industry?: string;
  source?: CustomerSource | string;
  assignedUser?: string;
  status: CustomerStatus;
  dealValue: number;
  tags: string[];
  notes: string;
  favorite?: boolean;
  archived?: boolean;
  lastContactDate: string;
  createdAt: string;
  updatedAt?: string;
  avatarColor: string;
  timeline?: CustomerTimelineEvent[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'archived';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  sizeBytes?: number;
  type?: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  action: string;
  author: string;
  timestamp: string;
}

export interface TaskReminder {
  id: string;
  type: 'due_soon' | 'custom';
  timeBeforeMinutes: number;
  sent?: boolean;
}

export interface TaskTimeLog {
  id: string;
  durationSeconds: number;
  description?: string;
  loggedAt: string;
  loggedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUser?: string;
  startDate?: string;
  dueDate: string;
  customerId?: string;
  customerName?: string;
  subtasks: SubTask[];
  tags: string[];
  labels?: string[];
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  timeSpentSeconds?: number;
  estimatedMinutes?: number;
  timerRunning?: boolean;
  timerStartedAt?: string;
  timeLogs?: TaskTimeLog[];
  reminders?: TaskReminder[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  activityHistory?: TaskActivity[];
  favorite?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type NoteCategory = 'Strategy' | 'Client Meeting' | 'Financials' | 'Product' | 'General';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  pinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  aiSummary?: string;
}

export type ActivityType = 'customer' | 'task' | 'note' | 'ai' | 'auth' | 'system';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RevenueMetric {
  month: string;
  revenue: number;
  expenses: number;
  dealsClosed: number;
}

export interface BusinessOverview {
  monthlyRevenue: number;
  revenueGrowthPct: number;
  activeCustomers: number;
  customerGrowthPct: number;
  pendingTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalNotes: number;
  revenueHistory: RevenueMetric[];
}

export type ViewTab =
  | 'landing'
  | 'dashboard'
  | 'customers'
  | 'tasks'
  | 'notes'
  | 'analytics'
  | 'team'
  | 'copilot'
  | 'billing'
  | 'automations'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'feedback'
  | 'about'
  | 'help'
  | 'support'
  | 'admin';

export type PlanTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';

export interface PlanLimits {
  users: number;
  storageGb: number;
  aiCredits: number;
  projects: number;
  customers: number;
  tasks: number;
}

export interface SubscriptionPlan {
  id: PlanTier | string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  limits: PlanLimits;
  isActive?: boolean;
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentProviderType = 'stripe' | 'razorpay' | 'paddle' | 'custom';

export interface WorkspaceSubscription {
  id: string;
  workspaceId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  provider: PaymentProviderType;
  providerSubscriptionId?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  workspaceId: string;
  provider: PaymentProviderType;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  workspaceId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  provider: PaymentProviderType;
  providerTransactionId?: string;
  failureReason?: string;
  createdAt: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  workspaceId: string;
  amount: number;
  taxAmount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  billingAddress?: BillingAddress;
  gstVatId?: string;
  pdfUrl?: string;
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  lineItems: {
    description: string;
    amount: number;
    quantity: number;
  }[];
}

export interface WorkspaceUsageStats {
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsedGb: number;
  storageLimitGb: number;
  seatsUsed: number;
  seatsLimit: number;
  projectsCount: number;
  projectsLimit: number;
  customersCount: number;
  customersLimit: number;
  tasksCount: number;
  tasksLimit: number;
  apiCallsCount: number;
}

export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'employee' | 'member' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logoUrl?: string;
  memberCount?: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  mobileNumber?: string;
  department?: string;
  jobTitle?: string;
  role: WorkspaceRole;
  status: 'active' | 'inactive' | 'invited' | 'suspended';
  joinedAt: string;
  mustChangePassword?: boolean;
  firstLoginCompleted?: boolean;
  tempPassword?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName?: string;
  name?: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  jobTitle?: string;
  role: WorkspaceRole;
  inviterName: string;
  inviterEmail: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
}

export interface InvitationLog {
  id: string;
  invitationId: string;
  workspaceId: string;
  action: 'created' | 'sent' | 'accepted' | 'cancelled' | 'expired';
  performedBy?: string;
  performedByEmail: string;
  details?: string;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'mention' | 'task_assigned' | 'comment' | 'invite' | 'system';
  read: boolean;
  targetType?: 'task' | 'customer' | 'workspace' | 'note';
  targetId?: string;
  createdAt: string;
}

export interface ItemComment {
  id: string;
  targetType: 'task' | 'customer' | 'note';
  targetId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  mentions?: string[];
  createdAt: string;
}

export interface UserPresence {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'idle' | 'offline';
  activeTab?: string;
  lastSeenAt: string;
}

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'custom';

export interface ChatSession {
  id: string;
  title: string;
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  tokensUsed?: number;
  promptType?: string;
}

export interface AISettings {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'email' | 'proposal' | 'marketing' | 'notes' | 'crm' | 'meeting' | 'brainstorm' | 'tasks' | 'project';
  description: string;
  promptText: string;
  iconName: string;
}

export interface AIUsageLog {
  id: string;
  sessionId: string;
  model: string;
  tokensUsed: number;
  responseTimeMs: number;
  createdAt: string;
}

export type TimeframePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

export interface ScheduledReport {
  id: string;
  title: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'email';
  isActive: boolean;
  lastSentAt?: string;
  nextRunAt?: string;
  createdAt: string;
}

export interface AnalyticsSnapshot {
  id: string;
  period: TimeframePeriod;
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  notesCreated: number;
  pipelineValue: number;
  aiSessionsCount: number;
  snapshotDate: string;
  createdAt: string;
}

// --- NOTIFICATION TYPES ---
export type NotificationType =
  | 'customer_added'
  | 'customer_updated'
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'reminder'
  | 'ai_completed'
  | 'workspace_invitation'
  | 'billing_reminder'
  | 'subscription_expiry'
  | 'system_update'
  | 'workflow_triggered';

export type NotificationCategory = 'crm' | 'tasks' | 'ai' | 'team' | 'billing' | 'system';

export interface AppNotification {
  id: string;
  workspaceId?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  metadata?: Record<string, any>;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailCrm: boolean;
  emailTasks: boolean;
  emailBilling: boolean;
  emailSystem: boolean;
  inAppCrm: boolean;
  inAppTasks: boolean;
  inAppAi: boolean;
  inAppTeam: boolean;
  inAppBilling: boolean;
  pushEnabled: boolean;
  digestFrequency: 'realtime' | 'daily' | 'weekly' | 'never';
  updatedAt: string;
}

// --- WORKFLOW AUTOMATION TYPES ---
export type TriggerType =
  | 'customer_created'
  | 'customer_updated'
  | 'task_created'
  | 'task_completed'
  | 'task_overdue'
  | 'new_team_member'
  | 'invoice_paid'
  | 'subscription_changed'
  | 'ai_request_finished'
  | 'webhook_received';

export type ConditionField =
  | 'status'
  | 'priority'
  | 'customer_tag'
  | 'date'
  | 'workspace'
  | 'user_role'
  | 'task_type';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export interface WorkflowCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}

export type ActionType =
  | 'create_task'
  | 'send_email'
  | 'send_notification'
  | 'create_note'
  | 'update_customer'
  | 'assign_user'
  | 'generate_ai_summary'
  | 'call_webhook';

export interface WorkflowActionConfig {
  actionType: ActionType;
  targetUser?: string;
  targetStatus?: string;
  emailSubject?: string;
  emailBody?: string;
  notificationMessage?: string;
  taskTitle?: string;
  taskPriority?: 'low' | 'medium' | 'high' | 'urgent';
  noteContent?: string;
  webhookUrl?: string;
  aiPrompt?: string;
  delayMinutes?: number;
}

export type StepKind = 'trigger' | 'condition' | 'action' | 'delay' | 'branch';

export interface WorkflowStep {
  id: string;
  workflowId: string;
  stepOrder: number;
  stepType: StepKind;
  conditionConfig?: WorkflowCondition;
  actionConfig?: WorkflowActionConfig;
  delayMinutes?: number;
  branchTrueStepId?: string;
  branchFalseStepId?: string;
}

export interface AutomationWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: TriggerType;
  triggerConfig?: Record<string, any>;
  steps: WorkflowStep[];
  runCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkflowRunStatus = 'running' | 'completed' | 'failed' | 'paused';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName?: string;
  workspaceId: string;
  status: WorkflowRunStatus;
  triggerEvent: TriggerType;
  triggerData: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface WorkflowLog {
  id: string;
  runId: string;
  workflowId: string;
  stepId?: string;
  logLevel: 'info' | 'warn' | 'error';
  message: string;
  stepOutput?: Record<string, any>;
  createdAt: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'sales' | 'tasks' | 'reporting' | 'ai';
  triggerType: TriggerType;
  steps: Omit<WorkflowStep, 'id' | 'workflowId'>[];
  iconName: string;
}

export interface WebhookEndpoint {
  id: string;
  workspaceId: string;
  name: string;
  endpointUrl: string;
  secretKey: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}
