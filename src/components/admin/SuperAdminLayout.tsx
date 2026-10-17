import React, { useState } from 'react';
import { SuperAdminService } from '../../services/superAdminService';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Bot,
  Sliders,
  FileText,
  MessageSquare,
  Activity,
  Lock,
  User,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Server,
  Database,
} from 'lucide-react';
import { SupabaseDiagnosticUtility } from './SupabaseDiagnosticUtility';
import {
  AdminUser,
  AuditLog,
  SupportTicket,
  FeatureFlag,
  SystemSetting,
  SystemMetrics,
  AdminImpersonationState,
} from '../../types/admin';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_PLATFORM_USERS,
  INITIAL_FEATURE_FLAGS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SYSTEM_METRICS,
} from './adminData';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminWorkspacesTab } from './AdminWorkspacesTab';
import { AdminSubscriptionsTab } from './AdminSubscriptionsTab';
import { AdminAIManagementTab } from './AdminAIManagementTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminAuditLogsTab } from './AdminAuditLogsTab';
import { AdminSupportCenterTab } from './AdminSupportCenterTab';
import { AdminSecurityMonitoringTab } from './AdminSecurityMonitoringTab';
import { AdminDevOpsTab } from './AdminDevOpsTab';
import { AdminTestingGuideModal } from './AdminTestingGuideModal';

interface SuperAdminLayoutProps {
  currentUserRole: string; // e.g. 'super_admin' or 'owner'
  onSwitchRoleToSuperAdmin: () => void;
  onStartImpersonation: (user: any) => void;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  currentUserRole,
  onSwitchRoleToSuperAdmin,
  onStartImpersonation,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Super Admin Persistent States
  const [platformUsers, setPlatformUsers] = useState(INITIAL_PLATFORM_USERS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(INITIAL_FEATURE_FLAGS);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>(INITIAL_SYSTEM_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM_METRICS);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showTestingGuideModal, setShowTestingGuideModal] = useState(false);

  // Helper to append audit logs
  const addAuditLog = (action: string, targetType: any, details: string, targetId?: string) => {
    const newLog: AuditLog = {
      id: 'audit_' + Date.now(),
      adminId: 'usr_admin_1',
      adminEmail: 'admin@cherryflow.io',
      action,
      targetType,
      targetId,
      details,
      ipAddress: '192.168.1.104',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Action Handlers
  const handleToggleUserStatus = (userId: string) => {
    setPlatformUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          addAuditLog(
            nextStatus === 'suspended' ? 'User Suspended' : 'User Reactivated',
            'user',
            `Changed status for user ${u.name} (${u.email}) to ${nextStatus}`,
            u.id
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    const target = platformUsers.find((u) => u.id === userId);
    setPlatformUsers((prev) => prev.filter((u) => u.id !== userId));
    if (target) {
      addAuditLog('User Permanently Deleted', 'user', `Deleted user account ${target.name} (${target.email})`, userId);
    }
  };

  const handleResetUserPassword = (userEmail: string) => {
    addAuditLog('Password Reset Dispatched', 'user', `Sent password reset security email to ${userEmail}`);
  };

  const handleImpersonateUser = (user: any) => {
    addAuditLog('User Impersonation Started', 'user', `Super admin initiated impersonation session for user ${user.name} (${user.email})`, user.id);
    onStartImpersonation(user);
  };

  const handleToggleFeatureFlag = (flagId: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => {
        if (f.id === flagId) {
          const nextVal = !f.enabled;
          addAuditLog(
            'Feature Flag Toggled',
            'system',
            `Changed feature flag '${f.name}' (${f.key}) to ${nextVal ? 'ENABLED' : 'DISABLED'}`,
            f.id
          );
          return { ...f, enabled: nextVal, updatedAt: new Date().toISOString() };
        }
        return f;
      })
    );
  };

  const handleCreateFeatureFlag = (newFlagData: Omit<FeatureFlag, 'id' | 'updatedAt'>) => {
    const created: FeatureFlag = {
      ...newFlagData,
      id: 'ff_' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    setFeatureFlags((prev) => [...prev, created]);
    addAuditLog('Feature Flag Created', 'system', `Created new feature flag '${created.name}' (${created.key})`);
  };

  const handleToggleMaintenanceMode = () => {
    setIsMaintenanceMode((prev) => {
      const next = !prev;
      addAuditLog(
        'Maintenance Mode Toggled',
        'system',
        `Platform maintenance mode was turned ${next ? 'ON' : 'OFF'}`
      );
      return next;
    });
  };

  const handleUpdateSystemSetting = (key: string, value: string) => {
    setSystemSettings((prev) =>
      prev.map((s) => {
        if (s.key === key) {
          return { ...s, value, updatedAt: new Date().toISOString() };
        }
        return s;
      })
    );
    addAuditLog('System Setting Updated', 'system', `Updated configuration for key '${key}'`);
  };

  const handleReplySupportTicket = (ticketId: string, replyText: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updatedMessages = [
            ...t.messages,
            {
              id: 'msg_' + Date.now(),
              sender: 'support' as const,
              authorName: 'Alexandra Vance (Super Admin)',
              text: replyText,
              createdAt: new Date().toISOString(),
            },
          ];
          addAuditLog('Support Reply Sent', 'support_ticket', `Sent reply on ticket #${t.ticketNumber}`, t.id);
          return { ...t, messages: updatedMessages, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const handleUpdateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          addAuditLog('Support Ticket Status Changed', 'support_ticket', `Updated ticket #${t.ticketNumber} status to ${status.toUpperCase()}`, t.id);
          return { ...t, status, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const handleUpgradeWorkspace = (workspaceId: string, newPlanTier: string) => {
    addAuditLog('Workspace Tier Overridden', 'subscription', `Manually updated workspace ${workspaceId} to ${newPlanTier.toUpperCase()} tier`, workspaceId);
  };

  const handleRefundTransaction = (txnId: string) => {
    addAuditLog('Payment Refund Dispatched', 'subscription', `Issued Stripe refund for transaction ${txnId}`, txnId);
  };

  // Security Authorization Check: If current user is not super_admin, display unlock screen
  const isAuthorized = currentUserRole === 'super_admin' || SuperAdminService.isSuperAdminLoggedIn();

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 animate-in fade-in">
        <div className="bg-white dark:bg-zinc-900 max-w-md w-full p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
              Super Admin Authorization Guard
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              This panel provides root governance over all customer workspaces, subscriptions, AI token consumption, and system settings.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            Current Session Role: <span className="font-bold text-amber-500 uppercase">{currentUserRole}</span>
          </div>

          <button
            onClick={onSwitchRoleToSuperAdmin}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Elevate Privilege to Super Admin</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Super Admin Nav Header Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-extrabold flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-zinc-900 dark:text-white">
                Developer & Super Admin Governance
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold uppercase text-[9px] border border-rose-200 dark:border-rose-900">
                DEVELOPER ROOT
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Logged in as <span className="font-bold text-rose-500 dark:text-rose-400">Developer Super Admin ({SuperAdminService.getSession()?.username || 'cherry_06'})</span>
            </p>
          </div>
        </div>

        {/* Sub-tab Pill Navigation & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              SuperAdminService.logout();
              window.location.reload();
            }}
            title="Terminate Super Admin Session"
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Sub-tab Pill Navigation */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl overflow-x-auto max-w-full">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'supabase_diagnostic', label: 'Supabase Diagnostic', icon: Database },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'workspaces', label: 'Workspaces', icon: Building2 },
            { id: 'subscriptions', label: 'Billing', icon: CreditCard },
            { id: 'ai', label: 'AI Models', icon: Bot },
            { id: 'settings', label: 'Settings & Flags', icon: Sliders },
            { id: 'devops', label: 'DevOps & Infrastructure', icon: Server },
            { id: 'audit_logs', label: 'Audit Trail', icon: FileText },
            { id: 'support', label: 'Support Queue', icon: MessageSquare },
            { id: 'monitoring', label: 'Infrastructure', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Render Switcher */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          metrics={metrics}
          isMaintenanceMode={isMaintenanceMode}
          onToggleMaintenanceMode={handleToggleMaintenanceMode}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenTestingGuide={() => setShowTestingGuideModal(true)}
        />
      )}

      {activeTab === 'supabase_diagnostic' && <SupabaseDiagnosticUtility />}

      {activeTab === 'users' && (
        <AdminUsersTab
          users={platformUsers}
          onToggleUserStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
          onResetUserPassword={handleResetUserPassword}
          onImpersonateUser={handleImpersonateUser}
        />
      )}

      {activeTab === 'workspaces' && (
        <AdminWorkspacesTab
          workspaces={[
            {
              id: 'ws_acme_1',
              name: 'Acme Corp Workspace',
              slug: 'acme-corp',
              ownerName: 'Sarah Chen',
              ownerEmail: 'sarah.chen@acmecorp.com',
              memberCount: 12,
              planTier: 'professional',
              status: 'active',
              storageUsedGb: 4.2,
              aiCreditsUsed: 1420,
              createdAt: '2026-01-10T08:00:00Z',
            },
            {
              id: 'ws_nexus_2',
              name: 'Nexus Main Hub',
              slug: 'nexus-tech',
              ownerName: 'Marcus Vance',
              ownerEmail: 'marcus@nexustech.io',
              memberCount: 28,
              planTier: 'business',
              status: 'active',
              storageUsedGb: 12.8,
              aiCreditsUsed: 4890,
              createdAt: '2026-01-22T11:20:00Z',
            },
            {
              id: 'ws_starlight_3',
              name: 'Starlight Team Studio',
              slug: 'starlight-agency',
              ownerName: 'Jessica Taylor',
              ownerEmail: 'jessica@starlightagency.com',
              memberCount: 5,
              planTier: 'starter',
              status: 'active',
              storageUsedGb: 1.1,
              aiCreditsUsed: 230,
              createdAt: '2026-03-05T14:00:00Z',
            },
            {
              id: 'ws_fintech_4',
              name: 'Global Fintech HQ',
              slug: 'global-fintech',
              ownerName: 'Liam O\'Connor',
              ownerEmail: 'liam@globalfintech.org',
              memberCount: 84,
              planTier: 'enterprise',
              status: 'active',
              storageUsedGb: 84.5,
              aiCreditsUsed: 18900,
              createdAt: '2026-02-01T09:00:00Z',
            },
          ]}
          onToggleWorkspaceStatus={(id) => {
            addAuditLog('Workspace Status Changed', 'workspace', `Toggled status for workspace ${id}`);
          }}
          onDeleteWorkspace={(id) => {
            addAuditLog('Workspace Deleted', 'workspace', `Permanently deleted workspace ${id}`);
          }}
          onTransferOwnership={(id, newOwner) => {
            addAuditLog('Workspace Ownership Transferred', 'workspace', `Transferred workspace ${id} to ${newOwner}`);
          }}
        />
      )}

      {activeTab === 'subscriptions' && (
        <AdminSubscriptionsTab
          onUpgradeWorkspace={handleUpgradeWorkspace}
          onRefundTransaction={handleRefundTransaction}
        />
      )}

      {activeTab === 'ai' && <AdminAIManagementTab />}

      {activeTab === 'settings' && (
        <AdminSettingsTab
          featureFlags={featureFlags}
          systemSettings={systemSettings}
          isMaintenanceMode={isMaintenanceMode}
          onToggleFeatureFlag={handleToggleFeatureFlag}
          onToggleMaintenanceMode={handleToggleMaintenanceMode}
          onUpdateSystemSetting={handleUpdateSystemSetting}
          onCreateFeatureFlag={handleCreateFeatureFlag}
        />
      )}

      {activeTab === 'devops' && <AdminDevOpsTab />}

      {activeTab === 'audit_logs' && <AdminAuditLogsTab auditLogs={auditLogs} />}

      {activeTab === 'support' && (
        <AdminSupportCenterTab
          tickets={supportTickets}
          onReplyTicket={handleReplySupportTicket}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onAssignStaff={(id, staff) => {
            addAuditLog('Ticket Staff Assigned', 'support_ticket', `Assigned staff member ${staff} to ticket ${id}`);
          }}
          onAddInternalNote={(id, note) => {
            addAuditLog('Ticket Note Added', 'support_ticket', `Added internal note to ticket ${id}`);
          }}
        />
      )}

      {activeTab === 'monitoring' && <AdminSecurityMonitoringTab metrics={metrics} />}

      {/* Testing Guide Modal */}
      {showTestingGuideModal && (
        <AdminTestingGuideModal onClose={() => setShowTestingGuideModal(false)} />
      )}
    </div>
  );
};
