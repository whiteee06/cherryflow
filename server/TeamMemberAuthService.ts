import crypto from 'crypto';
import dns from 'dns';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CreateTeamMemberParams {
  workspaceId: string;
  workspaceName?: string;
  name: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  jobTitle?: string;
  role?: string;
  tempPassword?: string;
}

export interface TeamMemberAuthResult {
  success: boolean;
  member: {
    id: string;
    workspaceId: string;
    userId: string;
    name: string;
    email: string;
    mobileNumber: string;
    department: string;
    jobTitle: string;
    role: string;
    status: string;
    mustChangePassword: boolean;
    firstLoginCompleted: boolean;
    tempPassword?: string;
    joinedAt: string;
  };
  tempPassword: string;
  authUserId: string;
  authNote: string;
}

export interface RegisterWorkspaceOwnerParams {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  role?: string;
}

export interface RegisterWorkspaceOwnerResult {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    businessName: string;
    role: string;
    currency: string;
    theme: string;
    emailVerified: boolean;
    firstLoginCompleted: boolean;
    mustChangePassword: boolean;
    defaultWorkspaceId: string;
    createdAt: string;
    lastLoginAt: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: any;
  };
  authNote: string;
}

export class TeamMemberAuthService {
  private static hostReachable: boolean | null = null;
  private static lastHostCheckTime = 0;
  private static lastHostFailureTime = 0;
  private static registeredEmails: Set<string> = new Set();

  /**
   * Check if configured Supabase host actually resolves via DNS
   */
  static async isSupabaseHostReachable(): Promise<boolean> {
    const url = process.env.VITE_SUPABASE_URL;
    if (!url || url.includes('your-project')) return false;

    const now = Date.now();
    if (this.hostReachable !== null && now - this.lastHostCheckTime < 60000) {
      return this.hostReachable;
    }

    try {
      const parsed = new URL(url);
      await dns.promises.lookup(parsed.hostname);
      this.hostReachable = true;
    } catch {
      this.hostReachable = false;
    }
    this.lastHostCheckTime = now;
    return this.hostReachable;
  }

  /**
   * Acquire a privileged Supabase Admin client with service_role privileges
   */
  static getSupabaseAdmin(): SupabaseClient | null {
    if (this.hostReachable === false) {
      return null;
    }
    const url = process.env.VITE_SUPABASE_URL;
    const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isServiceKeyValid =
      rawServiceKey &&
      !rawServiceKey.includes('your-service-role-key') &&
      rawServiceKey.startsWith('eyJ');

    const serviceKey = isServiceKeyValid ? rawServiceKey : process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !serviceKey || url.includes('your-project') || serviceKey.includes('your-anon-key')) {
      return null;
    }

    // If remote host failed recently (e.g. non-resolving mock domain), skip immediately for responsive UX
    if (Date.now() - this.lastHostFailureTime < 60000) {
      return null;
    }

    return createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: async (input, init) => {
          try {
            return await fetch(input, {
              ...init,
              signal: init?.signal || AbortSignal.timeout(8000),
            });
          } catch (fetchErr: any) {
            TeamMemberAuthService.hostReachable = false;
            TeamMemberAuthService.lastHostFailureTime = Date.now();
            throw fetchErr;
          }
        },
      },
    });
  }

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
   * Helper to check if string is valid UUID
   */
  static isUUID(val?: string): boolean {
    if (!val) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  }

  /**
   * Register a new Workspace Owner account using server-side Supabase Admin API.
   * Auto-confirms email, creates workspace, links owner in workspace_members & team_members.
   */
  static async registerWorkspaceOwner(params: RegisterWorkspaceOwnerParams): Promise<RegisterWorkspaceOwnerResult> {
    const { name, email, password, businessName } = params;

    if (!name || !email || !password) {
      throw new Error('Full name, email address, and password are required.');
    }

    const emailLower = email.trim().toLowerCase();
    if (this.registeredEmails.has(emailLower)) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    const sanitizedRole = 'owner';
    const finalBusinessName = businessName?.trim() || `${name.trim()}'s Business`;
    const isReachable = await this.isSupabaseHostReachable();
    const supabaseAdmin = isReachable ? this.getSupabaseAdmin() : null;

    let authUserId: string = crypto.randomUUID();
    let authNote = 'Sandbox account provisioned';

    // 1. Check for duplicate email in database & Supabase Auth
    if (supabaseAdmin) {
      try {
        const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!listErr && listData?.users) {
          const existing = listData.users.find((u: any) => u.email?.toLowerCase() === emailLower);
          if (existing) {
            throw new Error('An account with this email address already exists. Please sign in.');
          }
        }
      } catch (err: any) {
        if (err.message?.includes('already exists') || err.message?.includes('already registered')) {
          throw err;
        }
        if (!err.message?.includes('fetch failed') && !err.message?.includes('ENOTFOUND')) {
          console.warn('[TeamMemberAuthService.registerWorkspaceOwner] listUsers notice:', err.message);
        }
      }

      // Check database workspace_members for duplicate email
      try {
        const { data: dbMembers } = await supabaseAdmin
          .from('workspace_members')
          .select('id')
          .eq('email', emailLower);
        if (dbMembers && dbMembers.length > 0) {
          throw new Error('An account with this email address already exists. Please sign in.');
        }
      } catch (dbErr: any) {
        if (dbErr.message?.includes('already exists') || dbErr.message?.includes('already registered')) {
          throw dbErr;
        }
      }

      // 2. Provision Supabase Auth User with admin API (email_confirm: true)
      try {
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: emailLower,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: name.trim(),
            businessName: finalBusinessName,
            role: sanitizedRole,
            mustChangePassword: false,
            firstLoginCompleted: true,
          },
        });

        if (createError) {
          if (
            createError.message.includes('already registered') ||
            createError.message.includes('already exists') ||
            (createError as any).status === 422
          ) {
            throw new Error('An account with this email address already exists. Please sign in.');
          }
          if (
            createError.message.includes('fetch failed') ||
            createError.message.includes('ENOTFOUND') ||
            createError.message.includes('Failed to fetch')
          ) {
            this.hostReachable = false;
            authNote = 'Sandbox account provisioned';
          } else {
            console.warn('[TeamMemberAuthService.registerWorkspaceOwner] createUser notice:', createError.message);
            authNote = `Auth Note: ${createError.message}`;
          }
        } else if (createData?.user) {
          authUserId = createData.user.id;
          authNote = 'Account created and confirmed in Supabase Auth';
        }
      } catch (adminErr: any) {
        if (adminErr.message?.includes('already exists') || adminErr.message?.includes('already registered')) {
          throw adminErr;
        }
        if (!adminErr.message?.includes('fetch failed') && !adminErr.message?.includes('ENOTFOUND')) {
          console.warn('[TeamMemberAuthService.registerWorkspaceOwner] Admin exception:', adminErr.message);
        }
        authNote = 'Account provisioned locally (Supabase host unreachable)';
      }
    }

    // 3. Create Workspace & Link Owner in database
    const workspaceId = crypto.randomUUID();
    const workspaceName = `${finalBusinessName} Workspace`;
    const slug = finalBusinessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `ws-${Date.now()}`;
    const nowIso = new Date().toISOString();

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('workspaces').insert({
          id: workspaceId,
          name: workspaceName,
          slug,
          owner_id: authUserId,
          description: 'Primary workspace created upon account registration.',
          created_at: nowIso,
          updated_at: nowIso,
        });

        await supabaseAdmin.from('workspace_members').insert({
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          user_id: authUserId,
          name: name.trim(),
          email: emailLower,
          role: sanitizedRole,
          status: 'active',
          must_change_password: false,
          first_login_completed: true,
          joined_at: nowIso,
        });

        try {
          await supabaseAdmin.from('team_members_store').insert({
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            user_id: authUserId,
            name: name.trim(),
            email: emailLower,
            role: sanitizedRole,
            status: 'active',
            must_change_password: false,
            first_login_completed: true,
            joined_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
          });
        } catch {
          // Ignore if team_members_store table does not exist
        }
      } catch (dbErr: any) {
        console.warn('[TeamMemberAuthService.registerWorkspaceOwner] DB persist notice:', dbErr.message);
      }
    }

    const userProfile = {
      id: authUserId,
      name: name.trim(),
      email: emailLower,
      businessName: finalBusinessName,
      role: sanitizedRole,
      currency: '$',
      theme: 'dark' as const,
      emailVerified: true,
      firstLoginCompleted: true,
      mustChangePassword: false,
      defaultWorkspaceId: workspaceId,
      createdAt: nowIso,
      lastLoginAt: nowIso,
    };

    const session = {
      accessToken: `cf_tok_${Date.now()}_${authUserId.slice(0, 8)}`,
      refreshToken: `cf_ref_${Date.now()}_${authUserId.slice(0, 8)}`,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
      user: userProfile,
    };

    this.registeredEmails.add(emailLower);

    return {
      success: true,
      user: userProfile,
      workspace: {
        id: workspaceId,
        name: workspaceName,
        slug,
        ownerId: authUserId,
      },
      session,
      authNote,
    };
  }

  /**
   * Bridges database team_members / workspace_members table with Supabase Auth admin API.
   * Creates or updates the user in Supabase Auth, assigns the temporary password,
   * and persists the returned Supabase Auth user.id in the team members database records.
   */
  static async createOrSyncTeamMember(params: CreateTeamMemberParams): Promise<TeamMemberAuthResult> {
    const {
      workspaceId,
      workspaceName,
      name,
      email,
      mobileNumber,
      department,
      jobTitle,
      role = 'employee',
      tempPassword,
    } = params;

    if (!workspaceId || !email || !name) {
      throw new Error('Workspace ID, Name, and Email are required.');
    }

    const emailLower = email.trim().toLowerCase();

    if (this.registeredEmails.has(emailLower)) {
      throw new Error('An account with this email address already exists in the system. You cannot create a duplicate team member account.');
    }

    const finalTempPassword = tempPassword || this.generateTemporaryPassword();
    const isReachable = await this.isSupabaseHostReachable();
    const supabaseAdmin = isReachable ? this.getSupabaseAdmin() : null;

    if (supabaseAdmin) {
      try {
        const { data: existingWorkspaceMember } = await supabaseAdmin
          .from('workspace_members')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('email', emailLower);

        if (existingWorkspaceMember && existingWorkspaceMember.length > 0) {
          throw new Error('An account with this email address is already a member of this workspace.');
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('already a member')) {
          throw checkErr;
        }
      }
    }

    let authUserId: string | null = null;
    let authNote = 'Local sandbox account provisioned';

    if (supabaseAdmin) {
      try {
        // 1. Create User in Supabase Auth with email_confirm: true and metadata
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: emailLower,
          password: finalTempPassword,
          email_confirm: true,
          user_metadata: {
            name,
            role,
            mustChangePassword: true,
            defaultWorkspaceId: workspaceId,
            businessName: workspaceName || 'CherryFlow Workspace',
          },
        });

        if (createData?.user) {
          authUserId = createData.user.id;
          authNote = 'Account created and pre-confirmed in Supabase Auth';
        } else if (createError) {
          // If account already exists in Supabase Auth, synchronize password & metadata
          const isExisting =
            createError.message.includes('already registered') ||
            createError.message.includes('already exists') ||
            (createError as any).status === 422;

          if (isExisting) {
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = (listData?.users || []).find(
              (u: any) => u.email?.toLowerCase() === emailLower
            );

            if (existingUser) {
              authUserId = existingUser.id;
              await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password: finalTempPassword,
                email_confirm: true,
                user_metadata: {
                  ...existingUser.user_metadata,
                  name,
                  role,
                  mustChangePassword: true,
                  defaultWorkspaceId: workspaceId,
                  businessName: workspaceName || existingUser.user_metadata?.businessName,
                },
              });
              authNote = 'Existing Supabase Auth user password & workspace linked';
            }
          } else {
            if (
              createError.message.includes('fetch failed') ||
              createError.message.includes('ENOTFOUND') ||
              createError.message.includes('Failed to fetch')
            ) {
              this.hostReachable = false;
              authNote = 'Sandbox account provisioned';
            } else {
              console.warn('[TeamMemberAuthService] Supabase admin createUser notice:', createError.message);
              authNote = `Auth Note: ${createError.message}`;
            }
          }
        }
      } catch (adminErr: any) {
        if (!adminErr.message?.includes('fetch failed') && !adminErr.message?.includes('ENOTFOUND')) {
          console.warn('[TeamMemberAuthService] Supabase admin exception:', adminErr.message);
        }
        authNote = `Auth Notice: ${adminErr.message}`;
      }
    }

    const memberUuid = crypto.randomUUID();
    const realUserId = authUserId && this.isUUID(authUserId) ? authUserId : crypto.randomUUID();
    const memberId = memberUuid;
    const nowIso = new Date().toISOString();

    // 2. Persist to database: write to both team_members and workspace_members
    if (supabaseAdmin && this.isUUID(workspaceId)) {
      // Upsert into workspace_members
      try {
        await supabaseAdmin.from('workspace_members').upsert(
          {
            id: memberUuid,
            workspace_id: workspaceId,
            user_id: realUserId,
            name,
            email: emailLower,
            mobile_number: mobileNumber || '',
            department: department || 'General',
            job_title: jobTitle || 'Team Member',
            role,
            status: 'active',
            must_change_password: true,
            first_login_completed: false,
            temp_password: finalTempPassword,
            joined_at: nowIso,
          },
          { onConflict: 'workspace_id,email' }
        );
      } catch (dbErr: any) {
        console.warn('[TeamMemberAuthService] workspace_members upsert notice:', dbErr.message);
      }

      // Upsert into team_members / team_members_store
      try {
        await supabaseAdmin.from('team_members_store').upsert(
          {
            workspace_id: workspaceId,
            user_id: realUserId,
            name,
            email: emailLower,
            mobile_number: mobileNumber || '',
            department: department || 'General',
            job_title: jobTitle || 'Team Member',
            role,
            status: 'active',
            must_change_password: true,
            first_login_completed: false,
            temp_password: finalTempPassword,
            joined_at: nowIso,
          },
          { onConflict: 'workspace_id,email' }
        );
      } catch (dbErr: any) {
        // team_members_store might not exist in local mode, ignore gracefully
      }
    }

    return {
      success: true,
      member: {
        id: memberId,
        workspaceId,
        userId: realUserId,
        name,
        email: emailLower,
        mobileNumber: mobileNumber || '',
        department: department || 'General',
        jobTitle: jobTitle || 'Team Member',
        role,
        status: 'active',
        mustChangePassword: true,
        firstLoginCompleted: false,
        tempPassword: finalTempPassword,
        joinedAt: nowIso,
      },
      tempPassword: finalTempPassword,
      authUserId: realUserId,
      authNote,
    };
  }

  /**
   * Synchronizes credentials and auto-confirms user in Supabase Auth on login
   */
  static async syncMemberAuthPassword(email: string, password: string): Promise<{ success: boolean; userId: string; action: string }> {
    const emailLower = email.trim().toLowerCase();
    const isReachable = await this.isSupabaseHostReachable();
    const supabaseAdmin = isReachable ? this.getSupabaseAdmin() : null;

    if (!supabaseAdmin) {
      return { success: true, userId: `usr_${Date.now()}`, action: 'sandbox_mode' };
    }

    // 1. Check if member exists in workspace_members or team_members_store
    let memberData: any = null;
    try {
      const { data: memberRows } = await supabaseAdmin
        .from('workspace_members')
        .select('*')
        .eq('email', emailLower);
      if (memberRows && memberRows.length > 0) {
        memberData = memberRows[0];
      }
    } catch {
      // ignore
    }

    if (!memberData) {
      try {
        const { data: storeRows } = await supabaseAdmin
          .from('team_members_store')
          .select('*')
          .eq('email', emailLower);
        if (storeRows && storeRows.length > 0) {
          memberData = storeRows[0];
        }
      } catch {
        // ignore
      }
    }

    try {
      // 2. Query Supabase Auth for existing user
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuth = (listData?.users || []).find((u: any) => u.email?.toLowerCase() === emailLower);

      if (existingAuth) {
        // Update password & confirm email
        await supabaseAdmin.auth.admin.updateUserById(existingAuth.id, {
          password,
          email_confirm: true,
          user_metadata: {
            ...existingAuth.user_metadata,
            name: memberData?.name || existingAuth.user_metadata?.name || emailLower.split('@')[0],
            role: memberData?.role || existingAuth.user_metadata?.role || 'employee',
            defaultWorkspaceId: memberData?.workspace_id || existingAuth.user_metadata?.defaultWorkspaceId,
            mustChangePassword: memberData?.must_change_password ?? existingAuth.user_metadata?.mustChangePassword ?? false,
          },
        });

        // Sync user_id in database tables
        if (memberData && memberData.user_id !== existingAuth.id) {
          try {
            await supabaseAdmin.from('workspace_members').update({ user_id: existingAuth.id }).eq('id', memberData.id);
          } catch { /* ignore */ }
          try {
            await supabaseAdmin.from('team_members_store').update({ user_id: existingAuth.id }).eq('email', emailLower);
          } catch { /* ignore */ }
        }

        return { success: true, userId: existingAuth.id, action: 'updated' };
      } else {
        // Create user in Supabase Auth
        const { data: createRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: emailLower,
          password,
          email_confirm: true,
          user_metadata: {
            name: memberData?.name || emailLower.split('@')[0],
            role: memberData?.role || 'employee',
            mustChangePassword: memberData?.must_change_password ?? true,
            defaultWorkspaceId: memberData?.workspace_id,
          },
        });

        if (createErr || !createRes.user) {
          throw new Error(createErr?.message || 'Failed to provision Supabase Auth user.');
        }

        const newUserId = createRes.user.id;
        if (memberData) {
          try {
            await supabaseAdmin.from('workspace_members').update({ user_id: newUserId }).eq('id', memberData.id);
          } catch { /* ignore */ }
          try {
            await supabaseAdmin.from('team_members_store').update({ user_id: newUserId }).eq('email', emailLower);
          } catch { /* ignore */ }
        }

        return { success: true, userId: newUserId, action: 'created' };
      }
    } catch (networkErr: any) {
      console.warn('[TeamMemberAuthService] Network/Auth notice during sync:', networkErr.message);
      return {
        success: true,
        userId: memberData?.user_id || `usr_${Date.now()}`,
        action: 'fallback_sync_completed',
      };
    }
  }

  /**
   * Scans database members and provisions missing Supabase Auth accounts
   */
  static async syncAllExistingMembers(): Promise<{ totalMembers: number; authUsersCreated: number; membersLinked: number }> {
    const isReachable = await this.isSupabaseHostReachable();
    const supabaseAdmin = isReachable ? this.getSupabaseAdmin() : null;
    if (!supabaseAdmin) {
      return { totalMembers: 0, authUsersCreated: 0, membersLinked: 0 };
    }

    const { data: members, error: fetchErr } = await supabaseAdmin.from('workspace_members').select('*');
    if (fetchErr || !members) {
      throw new Error(fetchErr?.message || 'Failed to query members from database.');
    }

    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUsers: any[] = authUsersData?.users || [];

    let createdCount = 0;
    let updatedCount = 0;

    for (const member of members) {
      if (!member.email) continue;
      const emailLower = member.email.trim().toLowerCase();
      const existingAuth = existingAuthUsers.find((u: any) => u.email?.toLowerCase() === emailLower);

      const tempPass =
        member.temp_password ||
        this.generateTemporaryPassword();

      if (!existingAuth) {
        // Create missing Supabase Auth user
        const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
          email: emailLower,
          password: tempPass,
          email_confirm: true,
          user_metadata: {
            name: member.name,
            role: member.role || 'employee',
            mustChangePassword: member.must_change_password ?? true,
            defaultWorkspaceId: member.workspace_id,
          },
        });

        if (newUser?.user) {
          createdCount++;
          await supabaseAdmin
            .from('workspace_members')
            .update({ user_id: newUser.user.id, temp_password: tempPass })
            .eq('id', member.id);
          try {
            await supabaseAdmin
              .from('team_members_store')
              .update({ user_id: newUser.user.id, temp_password: tempPass })
              .eq('email', emailLower);
          } catch { /* ignore */ }
        }
      } else {
        // Ensure email confirmed & sync metadata
        await supabaseAdmin.auth.admin.updateUserById(existingAuth.id, {
          email_confirm: true,
          user_metadata: {
            ...existingAuth.user_metadata,
            name: member.name || existingAuth.user_metadata?.name,
            role: member.role || existingAuth.user_metadata?.role || 'employee',
            defaultWorkspaceId: member.workspace_id || existingAuth.user_metadata?.defaultWorkspaceId,
            mustChangePassword: member.must_change_password ?? existingAuth.user_metadata?.mustChangePassword ?? false,
          },
        });

        if (member.user_id !== existingAuth.id) {
          await supabaseAdmin
            .from('workspace_members')
            .update({ user_id: existingAuth.id })
            .eq('id', member.id);
          try {
            await supabaseAdmin
              .from('team_members_store')
              .update({ user_id: existingAuth.id })
              .eq('email', emailLower);
          } catch { /* ignore */ }
          updatedCount++;
        }
      }
    }

    return {
      totalMembers: members.length,
      authUsersCreated: createdCount,
      membersLinked: updatedCount,
    };
  }

  /**
   * Finalizes first login password change:
   * updates password in Auth, marks first_login_completed = true, must_change_password = false
   */
  static async completeFirstLoginPasswordChange(email: string, newPassword: string): Promise<boolean> {
    const emailLower = email.trim().toLowerCase();
    const isReachable = await this.isSupabaseHostReachable();
    const supabaseAdmin = isReachable ? this.getSupabaseAdmin() : null;

    if (supabaseAdmin) {
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuth = (listData?.users || []).find((u: any) => u.email?.toLowerCase() === emailLower);

        if (existingAuth) {
          await supabaseAdmin.auth.admin.updateUserById(existingAuth.id, {
            password: newPassword,
            email_confirm: true,
            user_metadata: {
              ...existingAuth.user_metadata,
              mustChangePassword: false,
              firstLoginCompleted: true,
            },
          });
        }

        // Update database records
        await supabaseAdmin
          .from('workspace_members')
          .update({
            must_change_password: false,
            first_login_completed: true,
            temp_password: null,
          })
          .eq('email', emailLower);

        try {
          await supabaseAdmin
            .from('team_members_store')
            .update({
              must_change_password: false,
              first_login_completed: true,
              temp_password: null,
            })
            .eq('email', emailLower);
        } catch { /* ignore */ }
      } catch (err) {
        console.warn('[TeamMemberAuthService] completeFirstLoginPasswordChange exception:', err);
      }
    }

    return true;
  }
}
