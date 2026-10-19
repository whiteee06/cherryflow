import { WorkspaceMember, WorkspaceInvitation, WorkspaceRole, InvitationLog, AuthSession, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityService } from './ActivityService';
import { WorkspaceService } from './WorkspaceService';

const MEMBERS_STORAGE_KEY = 'cherryflow_team_members';
const INVITATIONS_STORAGE_KEY = 'cherryflow_team_invitations';
const INVITATION_LOGS_KEY = 'cherryflow_invitation_logs';

const INITIAL_MEMBERS: WorkspaceMember[] = [
  {
    id: 'wm-1',
    workspaceId: 'ws-primary-default',
    userId: 'user-primary-owner',
    name: 'Workspace Owner',
    email: 'owner@cherryflow.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mobileNumber: '+1 (555) 019-2831',
    department: 'Executive',
    jobTitle: 'Founder & CEO',
    role: 'owner',
    status: 'active',
    joinedAt: new Date().toISOString(),
  },
];

const INITIAL_INVITATIONS: WorkspaceInvitation[] = [];

export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const specials = '!@#$%&*';
  let result = 'Cherry#';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += specials.charAt(Math.floor(Math.random() * specials.length));
  result += Math.floor(10 + Math.random() * 90);
  return result;
}

export class TeamService {
  /**
   * Check granular permissions based on workspace role
   */
  static hasPermission(
    role: WorkspaceRole,
    action:
      | 'manage_workspace'
      | 'billing'
      | 'manage_members'
      | 'invite_members'
      | 'manage_customers'
      | 'manage_tasks'
      | 'assign_tasks'
      | 'manage_projects'
      | 'view_analytics'
      | 'view_reports'
      | 'edit_content'
      | 'delete_content'
      | 'view_content'
  ): boolean {
    switch (role) {
      case 'owner':
        return true; // Full Access, Billing, Team Management, Workspace Settings, Delete Workspace
      case 'admin':
        // Manage Customers, Manage Tasks, Manage Team, View Reports (No Delete/Manage Workspace)
        if (action === 'manage_workspace' || action === 'billing') return false;
        return true;
      case 'manager':
        // Assign Tasks, Manage Projects, View Analytics, View/Edit Content
        return [
          'assign_tasks',
          'manage_projects',
          'view_analytics',
          'view_reports',
          'manage_tasks',
          'edit_content',
          'view_content',
        ].includes(action);
      case 'employee':
      case 'member':
        // View Assigned Tasks, Update Own Tasks, View Customers (if permitted)
        return ['view_content', 'edit_content', 'assign_tasks'].includes(action);
      case 'viewer':
        // Read-only Access
        return action === 'view_content';
      default:
        return false;
    }
  }

  /**
   * Get team members for workspace
   */
  static async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`${MEMBERS_STORAGE_KEY}_${workspaceId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      localStorage.setItem(`${MEMBERS_STORAGE_KEY}_${workspaceId}`, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('joined_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return INITIAL_MEMBERS;
      }

      return data.map((row: any) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        avatarUrl: row.avatar_url,
        mobileNumber: row.mobile_number || '',
        department: row.department || 'General',
        jobTitle: row.job_title || 'Team Member',
        role: row.role as WorkspaceRole,
        status: row.status as 'active' | 'inactive' | 'invited' | 'suspended',
        joinedAt: row.joined_at,
      }));
    } catch {
      return INITIAL_MEMBERS;
    }
  }

  /**
   * Edit full member profile (Role, Mobile, Department, Job Title)
   */
  static async editMemberDetails(
    workspaceId: string,
    memberId: string,
    updates: {
      name?: string;
      role?: WorkspaceRole;
      mobileNumber?: string;
      department?: string;
      jobTitle?: string;
      status?: 'active' | 'inactive' | 'invited' | 'suspended';
    }
  ): Promise<boolean> {
    const members = await this.getMembers(workspaceId);
    const index = members.findIndex((m) => m.id === memberId);
    if (index === -1) return false;

    members[index] = { ...members[index], ...updates };
    localStorage.setItem(`${MEMBERS_STORAGE_KEY}_${workspaceId}`, JSON.stringify(members));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('workspace_members')
          .update({
            name: updates.name,
            role: updates.role,
            mobile_number: updates.mobileNumber,
            department: updates.department,
            job_title: updates.jobTitle,
            status: updates.status,
          })
          .eq('id', memberId);
      } catch (err) {
        console.warn('Supabase member edit failed:', err);
      }
    }

    ActivityService.logActivity(
      'system',
      'Updated Team Member',
      `Updated member details for ${members[index].name} (${members[index].email})`
    );

    return true;
  }

  /**
   * Suspend or Reactivate member
   */
  static async updateMemberStatus(
    workspaceId: string,
    memberId: string,
    status: 'active' | 'suspended' | 'inactive'
  ): Promise<boolean> {
    return this.editMemberDetails(workspaceId, memberId, { status });
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    workspaceId: string,
    memberId: string,
    newRole: WorkspaceRole
  ): Promise<boolean> {
    return this.editMemberDetails(workspaceId, memberId, { role: newRole });
  }

  /**
   * Remove member from workspace
   */
  static async removeMember(workspaceId: string, memberId: string): Promise<boolean> {
    let members = await this.getMembers(workspaceId);
    const target = members.find((m) => m.id === memberId);
    if (!target) return false;

    members = members.filter((m) => m.id !== memberId);
    localStorage.setItem(`${MEMBERS_STORAGE_KEY}_${workspaceId}`, JSON.stringify(members));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('workspace_members').delete().eq('id', memberId);
      } catch (err) {
        console.warn('Supabase member remove error:', err);
      }
    }

    ActivityService.logActivity(
      'system',
      'Removed Member',
      `Removed ${target.name} (${target.email}) from workspace`
    );

    return true;
  }

  /**
   * Get workspace invitations
   */
  static async getInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`${INVITATIONS_STORAGE_KEY}_${workspaceId}`);
      if (stored) {
        try {
          const invs: WorkspaceInvitation[] = JSON.parse(stored);
          // Check expiration
          const now = Date.now();
          return invs.map((inv) => {
            if (inv.status === 'pending' && new Date(inv.expiresAt).getTime() < now) {
              return { ...inv, status: 'expired' };
            }
            return inv;
          });
        } catch {
          // ignore
        }
      }
      localStorage.setItem(`${INVITATIONS_STORAGE_KEY}_${workspaceId}`, JSON.stringify(INITIAL_INVITATIONS));
      return INITIAL_INVITATIONS;
    }

    try {
      const { data, error } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error || !data) return INITIAL_INVITATIONS;

      const now = Date.now();
      return data.map((row: any) => {
        let status = row.status;
        if (status === 'pending' && new Date(row.expires_at).getTime() < now) {
          status = 'expired';
        }
        return {
          id: row.id,
          workspaceId: row.workspace_id,
          name: row.name || '',
          email: row.email,
          mobileNumber: row.mobile_number || '',
          department: row.department || 'General',
          jobTitle: row.job_title || 'Team Member',
          role: row.role as WorkspaceRole,
          inviterName: row.inviter_name,
          inviterEmail: row.inviter_email,
          token: row.token,
          status: status as 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled',
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        };
      });
    } catch {
      return INITIAL_INVITATIONS;
    }
  }

  /**
   * Directly create a Team Member with an automatically generated temporary password.
   * Stores the account securely in Supabase and local auth store.
   * On first login, forces password change and automatically joins the existing workspace.
   */
  static async createMemberDirectly(params: {
    workspaceId: string;
    workspaceName: string;
    name: string;
    email: string;
    mobileNumber?: string;
    department?: string;
    jobTitle?: string;
    role: WorkspaceRole;
    createdByName: string;
    createdByEmail: string;
    tempPassword?: string;
  }): Promise<{ member: WorkspaceMember; tempPassword: string }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const creatorEmail = params.createdByEmail ? params.createdByEmail.trim().toLowerCase() : '';

    if (creatorEmail && cleanEmail === creatorEmail) {
      throw new Error('You cannot add your own email address as a team member.');
    }

    const existingMembers = await this.getMembers(params.workspaceId);
    if (existingMembers.some((m) => m.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address is already a member of your workspace.');
    }

    const existingInvitations = await this.getInvitations(params.workspaceId);
    const pendingInv = existingInvitations.find(
      (i) => i.email.trim().toLowerCase() === cleanEmail && i.status === 'pending'
    );
    if (pendingInv) {
      throw new Error('An invitation has already been sent to this email address.');
    }

    // Check if account already exists as a registered workspace owner / user
    const usersRaw = localStorage.getItem('cherryflow_registered_users');
    const existingUsers = usersRaw ? JSON.parse(usersRaw) : [];
    const registeredUser = existingUsers.find(
      (u: any) => u.email?.trim().toLowerCase() === cleanEmail
    );
    if (registeredUser) {
      throw new Error('An account with this email address already exists. You cannot create a duplicate team member account.');
    }

    const tempPassword = params.tempPassword || generateTemporaryPassword();
    let realUserId = `usr_${Date.now()}`;
    let newMemberId = `wm-${Date.now()}`;

    // 1. Call Server API endpoint to provision account in Supabase Auth
    try {
      const res = await fetch('/api/team/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          tempPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          newMemberId = data.member.id || newMemberId;
          realUserId = data.member.userId || data.authUserId || realUserId;
        }
      } else {
        const errorData = await res.json().catch(() => null);
        if (res.status === 409 || errorData?.code === 'EMAIL_ALREADY_EXISTS' || errorData?.error?.includes('already')) {
          throw new Error(errorData?.error || 'An account with this email address already exists.');
        }
        if (errorData?.error) {
          throw new Error(errorData.error);
        }
      }
    } catch (apiErr: any) {
      if (apiErr.message?.includes('already') || apiErr.message?.includes('cannot add')) {
        throw apiErr;
      }
      console.warn('API create-member fetch notice:', apiErr);
    }

    // 2. Direct client database fallback if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('workspace_members').upsert(
          {
            id: newMemberId,
            workspace_id: params.workspaceId,
            user_id: realUserId,
            name: params.name,
            email: params.email.toLowerCase(),
            mobile_number: params.mobileNumber || '',
            department: params.department || 'General',
            job_title: params.jobTitle || 'Team Member',
            role: params.role,
            status: 'active',
            must_change_password: true,
            first_login_completed: false,
            temp_password: tempPassword,
            joined_at: new Date().toISOString(),
          },
          { onConflict: 'workspace_id,email' }
        );
      } catch (err) {
        console.warn('Supabase member insertion notice:', err);
      }
    }

    // 3. Save account credentials in local user store for immediate login recognition
    const existingIndex = existingUsers.findIndex(
      (u: any) => u.email.toLowerCase() === params.email.toLowerCase()
    );

    const userProfileData = {
      id: realUserId,
      name: params.name,
      email: params.email.toLowerCase(),
      businessName: params.workspaceName || 'Cherry Operations',
      role: params.role,
      currency: '$',
      theme: 'dark',
      emailVerified: true,
      mustChangePassword: true,
      firstLoginCompleted: false,
      defaultWorkspaceId: params.workspaceId,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      existingUsers[existingIndex] = { ...existingUsers[existingIndex], ...userProfileData };
    } else {
      existingUsers.push(userProfileData);
    }
    localStorage.setItem('cherryflow_registered_users', JSON.stringify(existingUsers));

    // 4. Add to workspace members list
    const newMember: WorkspaceMember = {
      id: newMemberId,
      workspaceId: params.workspaceId,
      userId: realUserId,
      name: params.name,
      email: params.email.toLowerCase(),
      mobileNumber: params.mobileNumber || '',
      department: params.department || 'General',
      jobTitle: params.jobTitle || 'Team Member',
      role: params.role,
      status: 'active',
      mustChangePassword: true,
      firstLoginCompleted: false,
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...existingMembers, newMember];
    localStorage.setItem(`${MEMBERS_STORAGE_KEY}_${params.workspaceId}`, JSON.stringify(updatedMembers));

    ActivityService.logActivity(
      'system',
      'Created Team Member',
      `Directly created account for ${params.name} (${params.email}) with auto-generated password as ${params.role}`
    );

    return { member: newMember, tempPassword };
  }

  /**
   * Audit workspace_members and sync any existing team members to Supabase Auth
   */
  static async syncExistingMembers(): Promise<void> {
    try {
      await fetch('/api/team/sync-existing-members', { method: 'POST' });
    } catch (err) {
      console.warn('Sync existing members error:', err);
    }
  }

  /**
   * Complete forced password change on first login
   */
  static async completePasswordChange(email: string, newPassword: string): Promise<boolean> {
    const emailLower = email.trim().toLowerCase();

    // 1. Notify backend API to update Supabase Auth and mark first_login_completed = true
    try {
      await fetch('/api/team/complete-first-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, newPassword }),
      });
    } catch (apiErr) {
      console.warn('API complete-first-login notice:', apiErr);
    }

    // 2. Update registered users
    const usersRaw = localStorage.getItem('cherryflow_registered_users');
    if (usersRaw) {
      try {
        const users = JSON.parse(usersRaw);
        const user = users.find((u: any) => u.email.toLowerCase() === emailLower);
        if (user) {
          user.mustChangePassword = false;
          user.firstLoginCompleted = true;
          delete user.tempPassword;
          delete user.passwordHash;
          localStorage.setItem('cherryflow_registered_users', JSON.stringify(users));
        }
      } catch {
        // ignore
      }
    }

    // 3. Update active session
    const sessionRaw = localStorage.getItem('cherryflow_auth_session');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        if (session?.user && session.user.email.toLowerCase() === emailLower) {
          session.user.mustChangePassword = false;
          session.user.firstLoginCompleted = true;
          delete session.user.tempPassword;
          localStorage.setItem('cherryflow_auth_session', JSON.stringify(session));
        }
      } catch {
        // ignore
      }
    }

    // 4. Update Supabase client
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({
          password: newPassword,
          data: { mustChangePassword: false, firstLoginCompleted: true },
        });

        await supabase
          .from('workspace_members')
          .update({
            must_change_password: false,
            first_login_completed: true,
            temp_password: null,
          })
          .eq('email', emailLower);
      } catch (err) {
        console.warn('Supabase completePasswordChange error:', err);
      }
    }

    return true;
  }

  /**
   * Send a workspace invitation
   */
  static async sendInvitation(params: {
    workspaceId: string;
    workspaceName: string;
    name?: string;
    email: string;
    mobileNumber?: string;
    department?: string;
    jobTitle?: string;
    role: WorkspaceRole;
    inviterName: string;
    inviterEmail: string;
  }): Promise<WorkspaceInvitation> {
    const cleanEmail = params.email.trim().toLowerCase();
    const inviterEmail = params.inviterEmail ? params.inviterEmail.trim().toLowerCase() : '';

    if (inviterEmail && cleanEmail === inviterEmail) {
      throw new Error('You cannot send a workspace invitation to your own email address.');
    }

    const existingMembers = await this.getMembers(params.workspaceId);
    if (existingMembers.some((m) => m.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address is already a member of your workspace.');
    }

    const existingInvitations = await this.getInvitations(params.workspaceId);
    const pendingInv = existingInvitations.find(
      (i) => i.email.trim().toLowerCase() === cleanEmail && i.status === 'pending'
    );
    if (pendingInv) {
      throw new Error('An invitation has already been sent to this email.');
    }

    const token = `inv_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString(); // 7 Days Expiration

    const newInv: WorkspaceInvitation = {
      id: `inv-${Date.now()}`,
      workspaceId: params.workspaceId,
      workspaceName: params.workspaceName,
      name: params.name?.trim() || '',
      email: cleanEmail,
      mobileNumber: params.mobileNumber?.trim() || '',
      department: params.department?.trim() || 'General',
      jobTitle: params.jobTitle?.trim() || 'Team Member',
      role: params.role,
      inviterName: params.inviterName,
      inviterEmail: params.inviterEmail.trim().toLowerCase(),
      token,
      status: 'pending',
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    existingInvitations.unshift(newInv);
    localStorage.setItem(`${INVITATIONS_STORAGE_KEY}_${params.workspaceId}`, JSON.stringify(existingInvitations));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('workspace_invitations').insert({
          workspace_id: params.workspaceId,
          name: newInv.name,
          email: cleanEmail,
          mobile_number: newInv.mobileNumber,
          department: newInv.department,
          job_title: newInv.jobTitle,
          role: params.role,
          inviter_name: params.inviterName,
          inviter_email: newInv.inviterEmail,
          token,
          expires_at: expiresAt,
        });

        await supabase.from('invitation_logs').insert({
          invitation_id: newInv.id,
          workspace_id: params.workspaceId,
          action: 'sent',
          performed_by_email: newInv.inviterEmail,
          details: `Sent invitation to ${cleanEmail} (${newInv.name || 'User'}) for role ${params.role.toUpperCase()}`,
        });
      } catch (err) {
        console.warn('Supabase invitation send notice:', err);
      }
    }

    // Save invitation log locally
    this.addLogLocally(params.workspaceId, {
      id: `log-${Date.now()}`,
      invitationId: newInv.id,
      workspaceId: params.workspaceId,
      action: 'sent',
      performedByEmail: newInv.inviterEmail,
      details: `Sent invitation to ${cleanEmail} as ${params.role.toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });

    ActivityService.logActivity(
      'system',
      'Sent Team Invitation',
      `Invited ${cleanEmail} to join ${params.workspaceName} as ${params.role.toUpperCase()}`
    );

    return newInv;
  }

  /**
   * Get invitation by token
   */
  static async getInvitationByToken(token: string): Promise<{ invitation: WorkspaceInvitation | null; error?: string }> {
    if (!token) return { invitation: null, error: 'No invitation token provided.' };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('workspace_invitations')
          .select('*, workspaces(name)')
          .eq('token', token)
          .single();

        if (error || !data) {
          return { invitation: null, error: 'Invalid or expired invitation token.' };
        }

        const expiresAtMs = new Date(data.expires_at).getTime();
        if (data.status === 'cancelled') return { invitation: null, error: 'This invitation has been cancelled by the workspace owner.' };
        if (data.status === 'accepted') return { invitation: null, error: 'This invitation has already been accepted.' };
        if (data.status === 'expired' || expiresAtMs < Date.now()) return { invitation: null, error: 'This invitation has expired (7 day limit reached).' };

        const inv: WorkspaceInvitation = {
          id: data.id,
          workspaceId: data.workspace_id,
          workspaceName: data.workspaces?.name || 'CherryFlow Workspace',
          name: data.name || '',
          email: data.email?.trim().toLowerCase() || '',
          mobileNumber: data.mobile_number || '',
          department: data.department || '',
          jobTitle: data.job_title || '',
          role: data.role as WorkspaceRole,
          inviterName: data.inviter_name,
          inviterEmail: data.inviter_email,
          token: data.token,
          status: data.status,
          expiresAt: data.expires_at,
          createdAt: data.created_at,
        };

        return { invitation: inv };
      } catch {
        // fallback
      }
    }

    // Local storage lookup fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(INVITATIONS_STORAGE_KEY)) {
        try {
          const invs: WorkspaceInvitation[] = JSON.parse(localStorage.getItem(key) || '[]');
          const found = invs.find((item) => item.token === token);
          if (found) {
            if (found.status === 'cancelled') return { invitation: null, error: 'This invitation was cancelled.' };
            if (found.status === 'accepted') return { invitation: null, error: 'This invitation has already been used.' };
            if (new Date(found.expiresAt).getTime() < Date.now()) return { invitation: null, error: 'This invitation has expired.' };
            return { invitation: { ...found, email: found.email.trim().toLowerCase() } };
          }
        } catch {
          // ignore
        }
      }
    }

    return { invitation: null, error: 'Invitation token not found.' };
  }

  /**
   * Accept Invitation & Create Account in Existing Workspace
   */
  static async acceptInvitation(params: {
    token: string;
    password: string;
    name?: string;
  }): Promise<{ user: UserProfile; session: AuthSession; workspaceId: string }> {
    const { invitation, error } = await this.getInvitationByToken(params.token);
    if (error || !invitation) {
      throw new Error(error || 'Invalid or expired invitation token.');
    }

    const cleanEmail = invitation.email.trim().toLowerCase();
    const memberName = params.name?.trim() || invitation.name?.trim() || cleanEmail.split('@')[0];

    let userId = `usr_${Date.now()}`;
    let session: AuthSession;
    let userProfile: UserProfile;

    if (isSupabaseConfigured) {
      let authRes: any = null;
      let signUpError: any = null;

      try {
        const res = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              name: memberName,
              role: invitation.role,
              invitedWorkspaceId: invitation.workspaceId,
            },
          },
        });
        authRes = res.data;
        signUpError = res.error;
      } catch (err: any) {
        signUpError = err;
      }

      if (signUpError && (signUpError.message?.includes('already registered') || signUpError.message?.includes('already exists'))) {
        try {
          const syncRes = await fetch('/api/team/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: params.password }),
          });

          if (syncRes.ok) {
            const signInRes = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: params.password,
            });
            if (signInRes.data?.user) {
              authRes = signInRes.data;
              signUpError = null;
            }
          }
        } catch (syncErr) {
          console.warn('Sync existing user error during invitation acceptance:', syncErr);
        }
      }

      if (signUpError && !authRes?.user) {
        throw new Error(signUpError.message || 'Failed to complete registration for invitation.');
      }

      if (authRes?.user) {
        userId = authRes.user.id;
      }

      userProfile = {
        id: userId,
        name: memberName,
        email: cleanEmail,
        businessName: invitation.workspaceName || 'CherryFlow Enterprise',
        role: invitation.role,
        currency: '$',
        theme: 'dark',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      session = {
        accessToken: authRes?.session?.access_token || `jwt_${Date.now()}`,
        expiresAt: authRes?.session?.expires_at || Date.now() + 86400 * 7 * 1000,
        user: userProfile,
      };

      // Add to workspace_members in Supabase with upsert
      try {
        await supabase.from('workspace_members').upsert(
          {
            workspace_id: invitation.workspaceId,
            user_id: userId,
            name: memberName,
            email: cleanEmail,
            role: invitation.role,
            mobile_number: invitation.mobileNumber || '',
            department: invitation.department || 'General',
            job_title: invitation.jobTitle || 'Team Member',
            status: 'active',
          },
          { onConflict: 'workspace_id,email' }
        );

        // Mark invitation as accepted
        await supabase
          .from('workspace_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);

        await supabase.from('invitation_logs').insert({
          invitation_id: invitation.id,
          workspace_id: invitation.workspaceId,
          action: 'accepted',
          performed_by: userId,
          performed_by_email: cleanEmail,
          details: `${memberName} accepted invitation and joined workspace as ${invitation.role.toUpperCase()}`,
        });
      } catch (e) {
        console.warn('Supabase member join notice:', e);
      }
    } else {
      // Sandbox mode
      userProfile = {
        id: userId,
        name: memberName,
        email: cleanEmail,
        businessName: invitation.workspaceName || 'CherryFlow Enterprise',
        role: invitation.role,
        currency: '$',
        theme: 'dark',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      session = {
        accessToken: `mock_jwt_${Date.now()}`,
        expiresAt: Date.now() + 86400 * 7 * 1000,
        user: userProfile,
      };
    }

    // Local Storage Sync
    const localMembers = await this.getMembers(invitation.workspaceId);
    const existingIdx = localMembers.findIndex((m) => m.email.trim().toLowerCase() === cleanEmail);
    const newMemberRecord: WorkspaceMember = {
      id: existingIdx >= 0 ? localMembers[existingIdx].id : `wm-${Date.now()}`,
      workspaceId: invitation.workspaceId,
      userId,
      name: memberName,
      email: cleanEmail,
      mobileNumber: invitation.mobileNumber,
      department: invitation.department,
      jobTitle: invitation.jobTitle,
      role: invitation.role,
      status: 'active',
      joinedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      localMembers[existingIdx] = newMemberRecord;
    } else {
      localMembers.push(newMemberRecord);
    }
    localStorage.setItem(`${MEMBERS_STORAGE_KEY}_${invitation.workspaceId}`, JSON.stringify(localMembers));

    // Mark invitation accepted locally
    const invitations = await this.getInvitations(invitation.workspaceId);
    const invIndex = invitations.findIndex((i) => i.id === invitation.id);
    if (invIndex !== -1) {
      invitations[invIndex].status = 'accepted';
      localStorage.setItem(`${INVITATIONS_STORAGE_KEY}_${invitation.workspaceId}`, JSON.stringify(invitations));
    }

    // Set active workspace to joined workspace
    WorkspaceService.setActiveWorkspaceId(invitation.workspaceId);

    this.addLogLocally(invitation.workspaceId, {
      id: `log-${Date.now()}`,
      invitationId: invitation.id,
      workspaceId: invitation.workspaceId,
      action: 'accepted',
      performedBy: userId,
      performedByEmail: cleanEmail,
      details: `${memberName} joined the workspace as ${invitation.role.toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });

    ActivityService.logActivity(
      'system',
      'Accepted Invitation',
      `${memberName} (${cleanEmail}) accepted invitation and joined workspace`
    );

    return { user: userProfile, session, workspaceId: invitation.workspaceId };
  }

  /**
   * Cancel / Delete an invitation
   */
  static async cancelInvitation(workspaceId: string, invitationId: string, cancelledByEmail?: string): Promise<boolean> {
    let invitations = await this.getInvitations(workspaceId);
    const inv = invitations.find((i) => i.id === invitationId);
    if (!inv) return false;

    invitations = invitations.map((i) => (i.id === invitationId ? { ...i, status: 'cancelled' } : i));
    localStorage.setItem(`${INVITATIONS_STORAGE_KEY}_${workspaceId}`, JSON.stringify(invitations));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('workspace_invitations')
          .update({ status: 'cancelled' })
          .eq('id', invitationId);

        await supabase.from('invitation_logs').insert({
          invitation_id: invitationId,
          workspace_id: workspaceId,
          action: 'cancelled',
          performed_by_email: cancelledByEmail || 'Workspace Owner',
          details: `Cancelled invitation for ${inv.email}`,
        });
      } catch (err) {
        console.warn('Supabase cancel invitation error:', err);
      }
    }

    this.addLogLocally(workspaceId, {
      id: `log-${Date.now()}`,
      invitationId,
      workspaceId,
      action: 'cancelled',
      performedByEmail: cancelledByEmail || 'Workspace Owner',
      details: `Cancelled invitation for ${inv.email}`,
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Get Invitation Audit Logs
   */
  static async getInvitationLogs(workspaceId: string): Promise<InvitationLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('invitation_logs')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            invitationId: d.invitation_id,
            workspaceId: d.workspace_id,
            action: d.action,
            performedBy: d.performed_by,
            performedByEmail: d.performed_by_email,
            details: d.details,
            createdAt: d.created_at,
          }));
        }
      } catch {
        // fallback
      }
    }

    const stored = localStorage.getItem(`${INVITATION_LOGS_KEY}_${workspaceId}`);
    return stored ? JSON.parse(stored) : [];
  }

  private static addLogLocally(workspaceId: string, log: InvitationLog) {
    const logs = localStorage.getItem(`${INVITATION_LOGS_KEY}_${workspaceId}`);
    const list: InvitationLog[] = logs ? JSON.parse(logs) : [];
    list.unshift(log);
    localStorage.setItem(`${INVITATION_LOGS_KEY}_${workspaceId}`, JSON.stringify(list));
  }

  /**
   * Generate join link URL for invitation
   */
  static generateJoinLink(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}?invite_token=${token}`;
  }
}
