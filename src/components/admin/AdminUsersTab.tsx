import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  KeyRound,
  Eye,
  Trash2,
  UserCheck2,
  Shield,
  Activity,
  LogIn,
  AlertTriangle,
  User,
  CheckCircle2,
  X,
  MoreVertical,
} from 'lucide-react';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  businessName: string;
  workspaceName: string;
  workspaceId: string;
  role: string;
  planTier: string;
  status: string;
  aiCreditsUsed: number;
  storageGb: number;
  createdAt: string;
  lastLoginAt: string;
  ipAddress: string;
}

interface AdminUsersTabProps {
  users: PlatformUser[];
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onResetUserPassword: (userEmail: string) => void;
  onImpersonateUser: (user: PlatformUser) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onToggleUserStatus,
  onDeleteUser,
  onResetUserPassword,
  onImpersonateUser,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<PlatformUser | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName.toLowerCase().includes(search.toLowerCase()) ||
      u.workspaceName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesPlan = planFilter === 'all' || u.planTier === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Notice Banner */}
      {noticeMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, workspace or company..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Plan Tiers</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <span className="font-bold text-sm text-zinc-900 dark:text-white">
            User Accounts Directory ({filteredUsers.length} Users)
          </span>
          <span className="text-xs text-zinc-400">Multi-tenant User Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Workspace &amp; Company</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Usage (AI / Storage)</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.substring(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">{u.name}</span>
                        <span className="text-zinc-400 font-mono text-[11px]">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{u.workspaceName}</span>
                    <span className="text-zinc-400 text-[11px]">{u.businessName}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px] border border-rose-200 dark:border-rose-900">
                      {u.planTier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div>AI: {u.aiCreditsUsed} credits</div>
                    <div className="text-zinc-400">Storage: {u.storageGb} GB</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        u.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Impersonate User Button */}
                      <button
                        onClick={() => onImpersonateUser(u)}
                        title="Impersonate User (Audit Logged)"
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5 text-rose-500" />
                        <span>Impersonate</span>
                      </button>

                      {/* View Details */}
                      <button
                        onClick={() => setSelectedUserForDetails(u)}
                        title="View Login & Activity Details"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          onResetUserPassword(u.email);
                          triggerNotice(`Password reset magic link sent to ${u.email}`);
                        }}
                        title="Send Password Reset Email"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {/* Suspend / Reactivate Toggle */}
                      <button
                        onClick={() => {
                          onToggleUserStatus(u.id);
                          triggerNotice(
                            u.status === 'active' ? `Suspended user ${u.name}` : `Reactivated user ${u.name}`
                          );
                        }}
                        title={u.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          u.status === 'active'
                            ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        }`}
                      >
                        {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      {/* Delete User */}
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete user ${u.name}?`)) {
                            onDeleteUser(u.id);
                            triggerNotice(`Deleted user ${u.name}`);
                          }
                        }}
                        title="Permanently Delete User"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details & Login History Modal */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 max-w-2xl w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center">
                  {selectedUserForDetails.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    {selectedUserForDetails.name}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">{selectedUserForDetails.email}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-mono block">Workspace ID</span>
                  <span className="font-bold font-mono text-zinc-900 dark:text-white">
                    {selectedUserForDetails.workspaceId}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-mono block">Role &amp; Plan</span>
                  <span className="font-bold text-rose-500 uppercase">
                    {selectedUserForDetails.role} • {selectedUserForDetails.planTier} Tier
                  </span>
                </div>
              </div>

              {/* Login & Security Log */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-rose-500" />
                  <span>Recent Security &amp; Login History</span>
                </h4>

                <div className="space-y-2">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        Last Login Session
                      </span>
                      <span className="text-zinc-400 text-[11px] font-mono">
                        IP: {selectedUserForDetails.ipAddress} • Chrome 128 (macOS)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {new Date(selectedUserForDetails.lastLoginAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        Account Registered
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        Initial Workspace Provisioning
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {new Date(selectedUserForDetails.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 font-bold text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
