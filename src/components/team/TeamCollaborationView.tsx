import React, { useState, useEffect } from 'react';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceRole,
  AppNotification,
  UserPresence,
  ActivityLog,
  InvitationLog,
} from '../../types';
import { WorkspaceService } from '../../services/WorkspaceService';
import { TeamService } from '../../services/TeamService';
import { NotificationService } from '../../services/NotificationService';
import { CommentService } from '../../services/CommentService';
import { ActivityService } from '../../services/ActivityService';
import { WorkspaceSelector } from './WorkspaceSelector';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { InviteMemberModal } from './InviteMemberModal';
import { EditMemberModal } from './EditMemberModal';
import { TeamPresenceBar } from './TeamPresenceBar';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import {
  Users,
  Building2,
  UserPlus,
  Bell,
  Settings,
  Mail,
  Shield,
  Activity,
  Trash2,
  Save,
  Copy,
  Check,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Crown,
  Key,
  Briefcase,
  Phone,
  FileText,
  AlertCircle,
  Link2,
  Lock,
  ChevronRight,
  MoreVertical,
  Edit,
} from 'lucide-react';

interface TeamCollaborationViewProps {
  currentUser: { id: string; name: string; email: string; role?: string; avatarUrl?: string };
}

export const TeamCollaborationView: React.FC<TeamCollaborationViewProps> = ({ currentUser }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [invitationLogs, setInvitationLogs] = useState<InvitationLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [presences, setPresences] = useState<UserPresence[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const [activeSubTab, setActiveSubTab] = useState<'members' | 'invitations' | 'roles' | 'settings' | 'activity'>('members');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<WorkspaceMember | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Settings State
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const myMemberRecord = members.find((m) => m.userId === currentUser.id);
  const myRole: WorkspaceRole = (currentUser.role as WorkspaceRole) || myMemberRecord?.role || 'owner';
  const isOwner = myRole === 'owner';
  const isAdminOrOwner = myRole === 'owner' || myRole === 'admin';

  // Load Workspaces & Data
  const loadWorkspaceData = async () => {
    const wsList = await WorkspaceService.getWorkspaces();
    setWorkspaces(wsList);

    const activeId = WorkspaceService.getActiveWorkspaceId();
    setActiveWorkspaceId(activeId);

    if (activeId) {
      const mList = await TeamService.getMembers(activeId);
      setMembers(mList);

      const invList = await TeamService.getInvitations(activeId);
      setInvitations(invList);

      const logList = await TeamService.getInvitationLogs(activeId);
      setInvitationLogs(logList);
    }

    const notifList = await NotificationService.getNotifications();
    setNotifications(notifList);

    const presList = await CommentService.getOnlinePresence();
    setPresences(presList);

    const actList = await ActivityService.getActivities();
    setActivities(actList);
  };

  useEffect(() => {
    loadWorkspaceData();

    // Register user presence
    CommentService.updateMyPresence({
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl,
      status: 'online',
      activeTab: 'team',
    });
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      setWsName(activeWorkspace.name);
      setWsDesc(activeWorkspace.description || '');
    }
  }, [activeWorkspaceId, workspaces]);

  const handleSelectWorkspace = async (wsId: string) => {
    WorkspaceService.setActiveWorkspaceId(wsId);
    setActiveWorkspaceId(wsId);
    const mList = await TeamService.getMembers(wsId);
    setMembers(mList);

    const invList = await TeamService.getInvitations(wsId);
    setInvitations(invList);

    const logList = await TeamService.getInvitationLogs(wsId);
    setInvitationLogs(logList);
  };

  const handleStatusToggle = async (member: WorkspaceMember) => {
    const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
    await TeamService.updateMemberStatus(activeWorkspaceId, member.id, newStatus);
    const mList = await TeamService.getMembers(activeWorkspaceId);
    setMembers(mList);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the workspace?')) {
      await TeamService.removeMember(activeWorkspaceId, memberId);
      const mList = await TeamService.getMembers(activeWorkspaceId);
      setMembers(mList);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    await TeamService.cancelInvitation(activeWorkspaceId, invitationId, currentUser.email);
    const invList = await TeamService.getInvitations(activeWorkspaceId);
    setInvitations(invList);
    const logList = await TeamService.getInvitationLogs(activeWorkspaceId);
    setInvitationLogs(logList);
  };

  const handleSaveWsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId || !wsName.trim()) return;

    setIsSavingSettings(true);
    try {
      await WorkspaceService.updateWorkspace(activeWorkspaceId, {
        name: wsName.trim(),
        description: wsDesc.trim(),
      });
      loadWorkspaceData();
    } catch (err) {
      console.error('Failed to save workspace settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (workspaces.length <= 1) {
      alert('You cannot delete your primary workspace when no other workspaces exist.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${activeWorkspace?.name}"? This action cannot be undone.`)) {
      await WorkspaceService.deleteWorkspace(activeWorkspaceId);
      loadWorkspaceData();
    }
  };

  const copyInviteLink = (token: string) => {
    const url = TeamService.generateJoinLink(token);
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Filtered Members
  const filteredMembers = members.filter((m) => {
    const matchesQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.jobTitle && m.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesQuery && matchesRole && matchesStatus;
  });

  // Roles Summary Calculation
  const ownerCount = members.filter((m) => m.role === 'owner').length;
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const managerCount = members.filter((m) => m.role === 'manager').length;
  const employeeCount = members.filter((m) => m.role === 'employee' || m.role === 'member').length;
  const viewerCount = members.filter((m) => m.role === 'viewer').length;

  const pendingInvitesCount = invitations.filter((i) => i.status === 'pending').length;
  const activeMembersCount = members.filter((m) => m.status === 'active').length;

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'manager':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'employee':
      case 'member':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="text-rose-500" size={24} />
            <h2 className="text-2xl font-black tracking-tight">Team Members &amp; Workspace Management</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Invite members, manage workspace permissions, track invitations, and configure role access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Workspace Switcher */}
          <WorkspaceSelector
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelectWorkspace={handleSelectWorkspace}
            onCreateWorkspaceClick={() => setIsCreateWsOpen(true)}
            onWorkspaceSettingsClick={() => setActiveSubTab('settings')}
          />

          {/* Invite Member Button */}
          {isAdminOrOwner && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus size={15} />
              <span>Add Team Member</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all cursor-pointer relative"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Realtime Team Presence Bar */}
      <TeamPresenceBar presences={presences} />

      {/* Workspace Dashboard KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Workspace</span>
            <Building2 size={16} className="text-rose-500" />
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{activeWorkspace?.name || 'Primary'}</p>
          <span className="text-[10px] text-zinc-500">Owner: {myRole === 'owner' ? 'You' : 'Workspace Owner'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Members</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">{members.length}</p>
          <span className="text-[10px] text-emerald-500 font-medium">{activeMembersCount} Active Now</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Invites</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-500">{pendingInvitesCount}</p>
          <span className="text-[10px] text-zinc-500">7-Day Expiration Token</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Admins &amp; Managers</span>
            <Crown size={16} className="text-purple-500" />
          </div>
          <p className="text-xl font-black text-purple-500">{adminCount + managerCount}</p>
          <span className="text-[10px] text-zinc-500">{ownerCount} Owner, {adminCount} Admin</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Your Role</span>
            <Shield size={16} className="text-emerald-500" />
          </div>
          <p className="text-sm font-black text-emerald-500 uppercase">{myRole}</p>
          <span className="text-[10px] text-zinc-500">Full Workspace Access</span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'members'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Users size={15} />
            Team Members ({members.length})
          </button>

          <button
            onClick={() => setActiveSubTab('invitations')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'invitations'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Mail size={15} />
            Invitations ({invitations.length})
            {pendingInvitesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black">
                {pendingInvitesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'roles'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Key size={15} />
            Roles &amp; Permissions Matrix
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'settings'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Settings size={15} />
            Workspace Settings
          </button>

          <button
            onClick={() => setActiveSubTab('activity')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'activity'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Activity size={15} />
            Audit Logs
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MEMBERS */}
      {activeSubTab === 'members' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search team member by name, email, department, job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Filter size={14} /> Filter:
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Roles ({members.length})</option>
                <option value="owner">Owner ({ownerCount})</option>
                <option value="admin">Admin ({adminCount})</option>
                <option value="manager">Manager ({managerCount})</option>
                <option value="employee">Employee ({employeeCount})</option>
                <option value="viewer">Viewer ({viewerCount})</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Role &amp; Permissions</th>
                    <th className="py-3.5 px-4">Department / Title</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        No team members matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        {/* Member Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                member.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                                {member.name}
                                {member.userId === currentUser.id && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold">You</span>
                                )}
                              </p>
                              <p className="text-[11px] text-zinc-500 truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase ${getRoleBadgeClass(member.role)}`}>
                            {member.role === 'owner' && <Crown size={12} />}
                            {member.role}
                          </span>
                        </td>

                        {/* Department / Title */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">{member.jobTitle || 'Team Member'}</p>
                          <p className="text-[11px] text-zinc-500">{member.department || 'General'}</p>
                        </td>

                        {/* Mobile Number */}
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                          {member.mobileNumber || '—'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {member.status === 'suspended' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-bold uppercase">
                              <UserX size={12} /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase">
                              <UserCheck size={12} /> Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdminOrOwner && (
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                                title="Edit Member Profile"
                              >
                                <Edit size={14} />
                              </button>
                            )}

                            {isAdminOrOwner && member.role !== 'owner' && member.userId !== currentUser.id && (
                              <>
                                <button
                                  onClick={() => handleStatusToggle(member)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    member.status === 'suspended'
                                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                  }`}
                                  title={member.status === 'suspended' ? 'Reactivate Access' : 'Suspend Access'}
                                >
                                  {member.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                                </button>

                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
                                  title="Remove Member from Workspace"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INVITATIONS */}
      {activeSubTab === 'invitations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Mail size={16} className="text-rose-500" /> Workspace Invitations ({invitations.length})
            </h3>
            {isAdminOrOwner && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus size={14} />
                <span>Send New Invitation</span>
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-4">Invited Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Invited By</th>
                    <th className="py-3.5 px-4">Token Expiration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        No pending or past invitations found.
                      </td>
                    </tr>
                  ) : (
                    invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-zinc-900 dark:text-white">{inv.name || inv.email}</p>
                          <p className="text-[11px] text-zinc-500">{inv.email}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase ${getRoleBadgeClass(inv.role)}`}>
                            {inv.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                          <p className="font-semibold text-xs">{inv.inviterName}</p>
                          <p className="text-[11px] text-zinc-500">{inv.inviterEmail}</p>
                        </td>

                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                          {new Date(inv.expiresAt).toLocaleDateString()} ({new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </td>

                        <td className="py-3.5 px-4">
                          {inv.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase">
                              <Clock size={12} /> Pending (7 Days)
                            </span>
                          )}
                          {inv.status === 'accepted' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase">
                              <Check size={12} /> Accepted
                            </span>
                          )}
                          {inv.status === 'expired' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/30 text-zinc-500 text-[10px] font-bold uppercase">
                              Expired
                            </span>
                          )}
                          {inv.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-bold uppercase">
                              Cancelled
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => copyInviteLink(inv.token)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {copiedToken === inv.token ? <Check size={12} /> : <Copy size={12} />}
                                  <span>{copiedToken === inv.token ? 'Copied Link' : 'Copy Join Link'}</span>
                                </button>

                                {isAdminOrOwner && (
                                  <button
                                    onClick={() => handleCancelInvite(inv.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
                                    title="Cancel Invitation Token"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROLES MATRIX */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Key size={18} className="text-rose-500" /> CherryFlow Workspace Role Permissions Matrix
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Overview of exact permissions granted to each workspace role.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                {
                  role: 'Workspace Owner',
                  badge: 'owner',
                  desc: 'Full Access, Billing, Team Management, Workspace Settings, Delete Workspace',
                  perms: ['Full Access', 'Billing Management', 'Team Management', 'Delete Workspace', 'Manage Customers', 'Manage Tasks'],
                },
                {
                  role: 'Admin',
                  badge: 'admin',
                  desc: 'Manage Customers, Manage Tasks, Manage Team, View Reports',
                  perms: ['Manage Team', 'Manage Customers', 'Manage Tasks', 'View Analytics & Reports'],
                },
                {
                  role: 'Manager',
                  badge: 'manager',
                  desc: 'Assign Tasks, Manage Projects, View Analytics',
                  perms: ['Assign Tasks', 'Manage Projects', 'View Analytics', 'Update Own Tasks'],
                },
                {
                  role: 'Employee',
                  badge: 'employee',
                  desc: 'View Assigned Tasks, Update Own Tasks, View Customers',
                  perms: ['View Assigned Tasks', 'Update Own Tasks', 'View Customer CRM Details'],
                },
                {
                  role: 'Viewer',
                  badge: 'viewer',
                  desc: 'Read-only Access across workspace views',
                  perms: ['Read-only View Access'],
                },
              ].map((r) => (
                <div key={r.role} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase mb-1.5 ${getRoleBadgeClass(r.badge)}`}>
                      {r.role}
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1">
                    {r.perms.map((p) => (
                      <div key={p} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Settings size={20} className="text-rose-500" /> Workspace General Settings
            </h3>
            <p className="text-xs text-zinc-500">Configure workspace title, description, and administrative actions.</p>
          </div>

          <form onSubmit={handleSaveWsSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                required
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                disabled={!isOwner}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Description &amp; Purpose
              </label>
              <textarea
                rows={3}
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
                disabled={!isOwner}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
              />
            </div>

            {isOwner && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            )}
          </form>

          {/* Danger Zone */}
          {isOwner && (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} /> Danger Zone
              </h4>
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Delete Workspace</p>
                  <p className="text-[11px] text-zinc-500">Permanently delete this workspace and remove all team member associations.</p>
                </div>
                <button
                  onClick={handleDeleteWorkspace}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: AUDIT LOGS */}
      {activeSubTab === 'activity' && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity size={16} className="text-rose-500" /> Team &amp; Invitation Audit Trail
          </h3>

          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-3">
            {invitationLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">No invitation audit logs recorded yet.</p>
            ) : (
              invitationLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold uppercase text-[10px]">
                      {log.action}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{log.details}</p>
                      <p className="text-[10px] text-zinc-500">By {log.performedByEmail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <CreateWorkspaceModal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        currentUser={currentUser}
        onWorkspaceCreated={(ws) => {
          setIsCreateWsOpen(false);
          handleSelectWorkspace(ws.id);
        }}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={activeWorkspaceId}
        workspaceName={activeWorkspace?.name || 'CherryFlow'}
        inviterName={currentUser.name}
        inviterEmail={currentUser.email}
        onInviteSent={() => {
          loadWorkspaceData();
        }}
      />

      <EditMemberModal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        workspaceId={activeWorkspaceId}
        member={editingMember}
        onMemberUpdated={() => {
          loadWorkspaceData();
        }}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onNotificationsUpdated={async () => {
          const notifs = await NotificationService.getNotifications();
          setNotifications(notifs);
        }}
        onOpenPreferences={() => {}}
      />
    </div>
  );
};
