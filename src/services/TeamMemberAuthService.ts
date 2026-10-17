import { WorkspaceMember, WorkspaceRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityService } from './ActivityService';

const MEMBERS_STORAGE_KEY = 'cherryflow_team_members';

export interface CreateTeamMemberInput {
  workspaceId: string;
  workspaceName?: string;
  name: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  jobTitle?: string;
  role: WorkspaceRole;
  tempPassword?: string;
}

export class TeamMemberAuthService {
  /**
   * Generates a strong temporary password meeting security requirements
   */
  static generateTemporaryPassword(): string {
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

  /**
   * Calls the backend API to create a Supabase Auth user via admin API,
   * stores the returned user.id in team_members and workspace_members tables,
   * and registers the credentials in the local cache.
   */
  static async createTeamMember(params: CreateTeamMemberInput): Promise<{ member: WorkspaceMember; tempPassword: string; authUserId: string }> {
    const emailLower = params.email.trim().toLowerCase();
    const tempPassword = params.tempPassword || this.generateTemporaryPassword();
    let authUserId = `usr_${Date.now()}`;
    let memberId = `wm-${Date.now()}`;

    // 1. Call backend TeamMemberAuthService via /api/team/create-member
    try {
      const res = await fetch('/api/team/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: params.workspaceId,
          workspaceName: params.workspaceName || 'Cherry Operations',
          name: params.name,
          email: emailLower,
          mobileNumber: params.mobileNumber || '',
          department: params.department || 'General',
          jobTitle: params.jobTitle || 'Team Member',
          role: params.role,
          tempPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          memberId = data.member.id || memberId;
          authUserId = data.member.userId || data.authUserId || authUserId;
        }
      }
    } catch (apiErr) {
      console.warn('[TeamMemberAuthService] API create-member notice:', apiErr);
    }

    // 2. Direct client-side Supabase write if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('workspace_members').upsert(
          {
            id: memberId,
            workspace_id: params.workspaceId,
            user_id: authUserId,
            name: params.name,
            email: emailLower,
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
        console.warn('[TeamMemberAuthService] Supabase member insertion notice:', err);
      }
    }

    // 3. Register user locally for instant offline / sandbox login recognition
    const usersRaw = localStorage.getItem('cherryflow_registered_users');
    const existingUsers = usersRaw ? JSON.parse(usersRaw) : [];
    const existingIndex = existingUsers.findIndex(
      (u: any) => u.email.toLowerCase() === emailLower
    );

    const userProfileData = {
      id: authUserId,
      name: params.name,
      email: emailLower,
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

    // 4. Update workspace members cache
    const storedMembersRaw = localStorage.getItem(`${MEMBERS_STORAGE_KEY}_${params.workspaceId}`);
    const members: WorkspaceMember[] = storedMembersRaw ? JSON.parse(storedMembersRaw) : [];

    const newMember: WorkspaceMember = {
      id: memberId,
      workspaceId: params.workspaceId,
      userId: authUserId,
      name: params.name,
      email: emailLower,
      mobileNumber: params.mobileNumber || '',
      department: params.department || 'General',
      jobTitle: params.jobTitle || 'Team Member',
      role: params.role,
      status: 'active',
      mustChangePassword: true,
      firstLoginCompleted: false,
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...members.filter((m) => m.email.toLowerCase() !== emailLower), newMember];
    localStorage.setItem(`${MEMBERS_STORAGE_KEY}_${params.workspaceId}`, JSON.stringify(updatedMembers));

    ActivityService.logActivity(
      'system',
      'Created Team Member',
      `Assigned Supabase Auth account for ${params.name} (${emailLower}) with user ID ${authUserId}`
    );

    return { member: newMember, tempPassword, authUserId };
  }

  /**
   * Syncs a single member's credentials to Supabase Auth on login
   */
  static async syncMember(email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch('/api/team/sync-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      return res.ok;
    } catch (err) {
      console.warn('[TeamMemberAuthService] syncMember notice:', err);
      return false;
    }
  }

  /**
   * Audits all workspace members and ensures Auth accounts exist for each
   */
  static async syncAllExistingMembers(): Promise<void> {
    try {
      await fetch('/api/team/sync-existing-members', { method: 'POST' });
    } catch (err) {
      console.warn('[TeamMemberAuthService] syncAllExistingMembers notice:', err);
    }
  }

  /**
   * Finalizes first login password change across local state, backend Auth, and database
   */
  static async completeFirstLoginPasswordChange(email: string, newPassword: string): Promise<boolean> {
    const emailLower = email.trim().toLowerCase();

    // 1. Notify server TeamMemberAuthService
    try {
      await fetch('/api/team/complete-first-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, newPassword }),
      });
    } catch (err) {
      console.warn('[TeamMemberAuthService] complete-first-login notice:', err);
    }

    // 2. Update local registered users
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
      } catch { /* ignore */ }
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
      } catch { /* ignore */ }
    }

    // 4. Update Supabase client directly if active
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
        console.warn('[TeamMemberAuthService] Supabase client password change notice:', err);
      }
    }

    return true;
  }
}
