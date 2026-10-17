export type AdminRole = 'super_admin' | 'platform_admin' | 'support_admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  mfaEnabled: boolean;
  status: 'active' | 'suspended';
  lastLoginAt: string;
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
}

export type AuditTargetType = 'user' | 'workspace' | 'subscription' | 'system' | 'ai' | 'support_ticket' | 'security';

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: AuditTargetType;
  targetId?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'billing' | 'technical' | 'feature_request' | 'security' | 'onboarding';

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  workspaceId: string;
  workspaceName: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedStaff?: string;
  messages: TicketMessage[];
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'ai' | 'billing' | 'core' | 'beta';
  targetWorkspaces?: string[];
  updatedAt: string;
}

export interface SystemSetting {
  id: string;
  category: 'general' | 'branding' | 'smtp' | 'security' | 'ai' | 'storage';
  key: string;
  label: string;
  value: string;
  isSecret?: boolean;
  updatedAt: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'maintenance';
  active: boolean;
  targetPlans?: string[];
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  startTime: string;
  endTime: string;
  affectedServices: string[];
  createdAt: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  aiRequests: number;
  totalAiTokensUsed: number;
  storageUsedGb: number;
  apiCallsTotal: number;
  errorLogCount: number;
  systemHealthPct: number;
  newSignupsThisMonth: number;
  dbConnectionPoolPct: number;
  avgLatencyMs: number;
}

export interface AdminImpersonationState {
  isImpersonating: boolean;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  startedAt?: string;
}
