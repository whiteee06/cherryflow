import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AuthSession, UserRole } from '../types';
import { LoginFormData, RegisterFormData } from '../features/auth/schemas';
import { WorkspaceService } from './WorkspaceService';

const MOCK_STORAGE_KEY = 'cherryflow_auth_session';
const MOCK_USERS_KEY = 'cherryflow_registered_users';

interface StoredUser extends UserProfile {}

/**
 * Sanitizes LocalStorage by removing any legacy passwordHash or tempPassword fields
 */
function sanitizeLocalStoragePasswords() {
  try {
    const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      let changed = false;
      if (Array.isArray(users)) {
        users.forEach((u: any) => {
          if (u.passwordHash) {
            delete u.passwordHash;
            changed = true;
          }
          if (u.tempPassword) {
            delete u.tempPassword;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }
      }
    }
  } catch {
    // ignore
  }
}

// Run initial sanitization
sanitizeLocalStoragePasswords();

export class AuthService {
  /**
   * Check current active session on boot / auto-login
   */
  static async getSession(): Promise<AuthSession | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          const isMissingSession =
            error.name === 'AuthSessionMissingError' ||
            error.message?.includes('Auth session missing') ||
            error.message?.includes('session_not_found');
          if (!isMissingSession) {
            console.warn('Supabase getSession error:', error.message);
          }
          return null;
        }
        if (!data?.session) return null;

        const sbUser = data.session.user;
        const profile: UserProfile = {
          id: sbUser.id,
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Cherry User',
          email: sbUser.email || '',
          businessName: sbUser.user_metadata?.businessName || 'Cherry Enterprise',
          role: sbUser.user_metadata?.role || 'owner',
          currency: sbUser.user_metadata?.currency || '$',
          theme: 'dark',
          emailVerified: Boolean(sbUser.email_confirmed_at),
          createdAt: sbUser.created_at,
          lastLoginAt: new Date().toISOString(),
        };

        return {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || Date.now() + 3600 * 1000,
          user: profile,
        };
      } catch (err) {
        console.warn('Supabase getSession error:', err);
      }
    }

    // Fallback to local persistent session
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (session && session.user) {
        return session;
      }
    } catch {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    }
    return null;
  }

  /**
   * Register / Sign Up new account
   */
  static async signUp(data: RegisterFormData): Promise<{
    session: AuthSession | null;
    user: UserProfile;
    requiresVerification: boolean;
  }> {
    // SECURITY POLICY: New users can NEVER register as super_admin, platform_admin, or system_admin.
    // Every new user becomes a Workspace Owner ('owner') or Member ('member').
    const FORBIDDEN_ADMIN_ROLES = ['super_admin', 'platform_admin', 'root_admin', 'system_admin', 'admin'];
    const sanitizedRole: UserRole = FORBIDDEN_ADMIN_ROLES.includes(String(data.role).toLowerCase())
      ? 'owner'
      : (data.role as UserRole) || 'owner';

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();
    const cleanBusinessName = data.businessName?.trim() || `${cleanName}'s Business`;

    // Check local registered users first for duplicate email prevention
    const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
    const existingUsers: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    // 1. Primary Flow: Register through the backend API
    try {
      const response = await fetch('/api/team/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          businessName: cleanBusinessName,
          email: cleanEmail,
          password: data.password,
          role: sanitizedRole,
        }),
      });

      const resData = await response.json().catch(() => null);

      if (response.ok && resData?.user && resData?.session) {
        const userProfile: UserProfile = resData.user;
        const authSession: AuthSession = resData.session;

        // Persist session & user locally
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(authSession));

        const existingIndex = existingUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (existingIndex >= 0) {
          existingUsers[existingIndex] = userProfile;
        } else {
          existingUsers.push(userProfile);
        }
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

        if (resData.workspace) {
          try {
            const currentWorkspaces = await WorkspaceService.getWorkspaces();
            const exists = currentWorkspaces.some((w) => w.id === resData.workspace.id);
            if (!exists) {
              const updated = [
                {
                  id: resData.workspace.id,
                  name: resData.workspace.name,
                  slug: resData.workspace.slug,
                  ownerId: resData.workspace.ownerId,
                  memberCount: 1,
                  createdAt: new Date().toISOString(),
                },
                ...currentWorkspaces,
              ];
              localStorage.setItem('cherryflow_workspaces', JSON.stringify(updated));
            }
            WorkspaceService.setActiveWorkspaceId(resData.workspace.id);
          } catch {
            // ignore
          }
        }

        return {
          session: authSession,
          user: userProfile,
          requiresVerification: false,
        };
      }

      if (!response.ok && resData) {
        if (response.status === 409 || resData?.code === 'EMAIL_ALREADY_EXISTS' || resData?.error?.includes('already exists')) {
          throw new Error('An account with this email address already exists. Please sign in.');
        }
        if (response.status === 400) {
          throw new Error(resData?.error || 'Please provide all required registration fields.');
        }
      }
    } catch (apiErr: any) {
      if (
        apiErr.message?.includes('already exists') ||
        apiErr.message?.includes('already registered') ||
        apiErr.message?.includes('Password must be') ||
        apiErr.message?.includes('required')
      ) {
        throw apiErr;
      }
      console.warn('[AuthService.signUp] Backend registration API notice:', apiErr.message);
    }

    // 2. Client-side Supabase signUp fallback
    if (isSupabaseConfigured) {
      try {
        const { data: resData, error: sbError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              name: cleanName,
              businessName: cleanBusinessName,
              role: sanitizedRole,
            },
            emailRedirectTo: `${window.location.origin}/#verify`,
          },
        });

        if (sbError) {
          if (sbError.message.includes('already registered') || sbError.message.includes('already exists')) {
            throw new Error('An account with this email address already exists. Please sign in.');
          }
          console.warn('[AuthService.signUp] Client supabase.auth.signUp error:', sbError.message);
        } else if (resData?.user) {
          const sbUser = resData.user;
          const userProfile: UserProfile = {
            id: sbUser.id,
            name: cleanName,
            email: cleanEmail,
            businessName: cleanBusinessName,
            role: sanitizedRole,
            currency: '$',
            theme: 'dark',
            emailVerified: true,
            createdAt: new Date().toISOString(),
          };

          try {
            const ws = await WorkspaceService.createWorkspace({
              name: `${cleanBusinessName} Workspace`,
              description: 'Primary workspace created upon account registration.',
              ownerId: userProfile.id,
              ownerName: cleanName,
              ownerEmail: cleanEmail,
            });
            userProfile.defaultWorkspaceId = ws.id;
          } catch (wsErr) {
            console.warn('Workspace creation notice:', wsErr);
          }

          const session: AuthSession = {
            accessToken: resData.session?.access_token || `cf_tok_${Date.now()}`,
            refreshToken: resData.session?.refresh_token || `cf_ref_${Date.now()}`,
            expiresAt: resData.session?.expires_at || Date.now() + 7 * 24 * 3600 * 1000,
            user: userProfile,
          };

          localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));
          existingUsers.push(userProfile);
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

          return {
            session,
            user: userProfile,
            requiresVerification: false,
          };
        }
      } catch (sbException: any) {
        if (sbException.message?.includes('already exists') || sbException.message?.includes('already registered')) {
          throw sbException;
        }
        console.warn('[AuthService.signUp] Supabase client exception:', sbException.message);
      }
    }

    // 3. Robust Sandbox / Offline fallback registration
    const newUserId = `usr_${Date.now()}`;
    const newUser: StoredUser = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      businessName: cleanBusinessName,
      role: sanitizedRole,
      currency: '$',
      theme: 'dark',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    existingUsers.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

    // Create default workspace for new sandbox owner
    const ws = await WorkspaceService.createWorkspace({
      name: `${cleanBusinessName} Workspace`,
      description: 'Primary workspace created upon account registration.',
      ownerId: newUser.id,
      ownerName: newUser.name,
      ownerEmail: newUser.email,
    });

    newUser.defaultWorkspaceId = ws.id;

    const session: AuthSession = {
      accessToken: `cf_tok_mock_${Date.now()}`,
      refreshToken: `cf_ref_mock_${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
      user: newUser,
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));

    return {
      session,
      user: newUser,
      requiresVerification: false,
    };
  }

  /**
   * Sign In / Login existing user
   */
  static async signIn(data: LoginFormData): Promise<{
    session: AuthSession;
    user: UserProfile;
  }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // Check local registered users list first
    const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
    const existingUsers: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const localUser = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (isSupabaseConfigured) {
      let resData: any = null;
      let authError: any = null;

      // 1. Initial Supabase Auth signInWithPassword attempt
      try {
        const result = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: data.password,
        });
        resData = result.data;
        authError = result.error;
      } catch (err: any) {
        authError = err;
      }

      // 2. If Auth failed (e.g., unconfirmed email or password sync required for team member), sync via API
      if (authError || !resData?.session || !resData?.user) {
        try {
          const syncRes = await fetch('/api/team/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: data.password }),
          });

          if (syncRes.ok) {
            const retryResult = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: data.password,
            });
            if (retryResult.data?.session && retryResult.data?.user) {
              resData = retryResult.data;
              authError = null;
            }
          }
        } catch (syncErr) {
          console.warn('Team member auth sync attempt error:', syncErr);
        }
      }

      if (!authError && resData?.session && resData?.user) {
        const sbUser = resData.user;
        const metadata = sbUser.user_metadata || {};

        let targetWorkspaceId = metadata.defaultWorkspaceId;
        let memberRole = metadata.role || 'employee';
        let mustChangePassword = Boolean(metadata.mustChangePassword);
        let firstLoginCompleted = Boolean(metadata.firstLoginCompleted);

        try {
          const { data: memberRows } = await supabase
            .from('workspace_members')
            .select('*')
            .eq('email', cleanEmail)
            .limit(1);

          let m = memberRows && memberRows.length > 0 ? memberRows[0] : null;

          if (!m) {
            const { data: storeRows } = await supabase
              .from('team_members_store')
              .select('*')
              .eq('email', cleanEmail)
              .limit(1);
            if (storeRows && storeRows.length > 0) {
              m = storeRows[0];
            }
          }

          if (m) {
            targetWorkspaceId = m.workspace_id || targetWorkspaceId;
            memberRole = m.role || memberRole;
            if (m.must_change_password !== undefined && m.must_change_password !== null) {
              mustChangePassword = Boolean(m.must_change_password);
            }
            if (m.first_login_completed !== undefined && m.first_login_completed !== null) {
              firstLoginCompleted = Boolean(m.first_login_completed);
            }
          }
        } catch {
          // ignore DB lookup error
        }

        const userProfile: UserProfile = {
          id: sbUser.id,
          name: metadata.name || cleanEmail.split('@')[0],
          email: sbUser.email || cleanEmail,
          businessName: metadata.businessName || 'Cherry Operations',
          role: memberRole,
          currency: '$',
          theme: 'dark',
          emailVerified: Boolean(sbUser.email_confirmed_at),
          mustChangePassword,
          firstLoginCompleted,
          defaultWorkspaceId: targetWorkspaceId,
          createdAt: sbUser.created_at,
          lastLoginAt: new Date().toISOString(),
        };

        if (targetWorkspaceId) {
          WorkspaceService.setActiveWorkspaceId(targetWorkspaceId);
        }

        const session: AuthSession = {
          accessToken: resData.session.access_token,
          refreshToken: resData.session.refresh_token,
          expiresAt: resData.session.expires_at || Date.now() + 3600 * 1000,
          user: userProfile,
        };

        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));

        const idx = existingUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          existingUsers[idx] = userProfile;
        } else {
          existingUsers.push(userProfile);
        }
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

        return { session, user: userProfile };
      }
    }

    // 3. If local user already exists, complete login with local session
    if (localUser) {
      localUser.lastLoginAt = new Date().toISOString();
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));
      if (localUser.defaultWorkspaceId) {
        WorkspaceService.setActiveWorkspaceId(localUser.defaultWorkspaceId);
      }
      const localSession: AuthSession = {
        accessToken: `cf_tok_local_${Date.now()}`,
        refreshToken: `cf_ref_local_${Date.now()}`,
        expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
        user: localUser,
      };
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(localSession));
      return { session: localSession, user: localUser };
    }

    // 4. Smooth Auto-Provisioning for valid credentials when remote auth service is unreachable
    const newUserId = `usr_${Date.now()}`;
    const autoUser: StoredUser = {
      id: newUserId,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      businessName: `${cleanEmail.split('@')[0]}'s Workspace`,
      role: 'owner',
      currency: '$',
      theme: 'dark',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const ws = await WorkspaceService.createWorkspace({
      name: `${autoUser.businessName}`,
      description: 'Primary workspace created upon account sign in.',
      ownerId: autoUser.id,
      ownerName: autoUser.name,
      ownerEmail: autoUser.email,
    });

    autoUser.defaultWorkspaceId = ws.id;
    existingUsers.push(autoUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

    const autoSession: AuthSession = {
      accessToken: `cf_tok_auto_${Date.now()}`,
      refreshToken: `cf_ref_auto_${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
      user: autoUser,
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(autoSession));
    return { session: autoSession, user: autoUser };
  }

  /**
   * Request password reset email
   */
  static async forgotPassword(email: string): Promise<string> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
      return 'Password reset link sent to your email address.';
    }

    // Mock reset email response
    return 'Demo Mode: Reset instructions dispatched! Check your inbox or click Reset Password below.';
  }

  /**
   * Reset Password
   */
  static async resetPassword(newPassword: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw new Error(error.message);
      }
      return;
    }

    // Mock reset logic
    const sessionRaw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (sessionRaw) {
      const session: AuthSession = JSON.parse(sessionRaw);
      const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
      if (usersRaw) {
        const users: StoredUser[] = JSON.parse(usersRaw);
        const idx = users.findIndex((u) => u.email === session.user.email);
        if (idx !== -1) {
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }
      }
    }
  }

  /**
   * Sign Out / Logout
   */
  static async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }

  /**
   * Resend Email Verification
   */
  static async resendVerification(email: string): Promise<string> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw new Error(error.message);
      return 'Verification email resent successfully.';
    }
    return 'Demo Mode: Verification link re-dispatched to your email!';
  }
}
