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

    // 1. Primary Flow: Register through the backend API with server-side Supabase Admin API
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

      if (!response.ok) {
        if (response.status === 409 || resData?.code === 'EMAIL_ALREADY_EXISTS') {
          throw new Error('An account with this email address already exists. Please sign in.');
        }
        if (response.status === 400) {
          throw new Error(resData?.error || 'Please provide all required registration fields.');
        }
        throw new Error(resData?.error || 'Registration failed on server. Please try again.');
      }

      if (resData?.user && resData?.session) {
        const userProfile: UserProfile = resData.user;
        const authSession: AuthSession = resData.session;

        // Persist session & user locally
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(authSession));

        // Persist in local registered users cache
        const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
        const existingUsers: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
        const existingIndex = existingUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        const storedUserRecord: StoredUser = {
          ...userProfile,
        };
        if (existingIndex >= 0) {
          existingUsers[existingIndex] = storedUserRecord;
        } else {
          existingUsers.push(storedUserRecord);
        }
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

        // If workspace returned, store and activate it
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
    } catch (apiErr: any) {
      // If it's a known conflict or validation error, rethrow immediately
      if (
        apiErr.message?.includes('already exists') ||
        apiErr.message?.includes('already registered') ||
        apiErr.message?.includes('Password must be') ||
        apiErr.message?.includes('required')
      ) {
        throw apiErr;
      }

      console.warn('[AuthService.signUp] Backend registration API notice:', apiErr.message);

      // Safe error handling for network / connection errors:
      // If the backend was unreachable (e.g. offline dev server or network failure),
      // fallback smoothly to local sandbox registration so the user is NEVER blocked by a raw "Failed to fetch"!
    }

    // 2. Client-side Supabase signUp attempt ONLY if client is genuinely reachable and backend wasn't available
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
            emailVerified: Boolean(sbUser.email_confirmed_at),
            createdAt: new Date().toISOString(),
          };

          try {
            await WorkspaceService.createWorkspace({
              name: `${cleanBusinessName} Workspace`,
              description: 'Primary workspace created upon account registration.',
              ownerId: userProfile.id,
              ownerName: cleanName,
              ownerEmail: cleanEmail,
            });
          } catch (wsErr) {
            console.warn('Workspace creation notice:', wsErr);
          }

          const session: AuthSession | null = resData.session
            ? {
                accessToken: resData.session.access_token,
                refreshToken: resData.session.refresh_token,
                expiresAt: resData.session.expires_at || Date.now() + 3600 * 1000,
                user: userProfile,
              }
            : null;

          return {
            session,
            user: userProfile,
            requiresVerification: !sbUser.email_confirmed_at,
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
    const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
    const existingUsers: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

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
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        businessName: newUser.businessName,
        role: newUser.role,
        currency: newUser.currency,
        theme: newUser.theme,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt,
        lastLoginAt: newUser.lastLoginAt,
        defaultWorkspaceId: ws.id,
      },
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));

    return {
      session,
      user: session.user,
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

        // Find member details & target workspace ID
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
        return { session, user: userProfile };
      }

      // If Supabase is configured, ALWAYS throw the exact authentication error returned by Supabase Auth!
      // NEVER allow insecure local password comparison fallbacks to bypass server-side verification.
      throw new Error(
        authError?.message || 'Invalid email address or password. Please verify your credentials and try again.'
      );
    }

    // Unconfigured offline sandbox mode
    const usersRaw = localStorage.getItem(MOCK_USERS_KEY);
    const existingUsers: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    const found = existingUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!found) {
      throw new Error('No account found with this email address. Please check your spelling or sign up for an account.');
    }

    // In offline sandbox mode without Supabase, require live Supabase connection to verify credentials
    throw new Error('Live Supabase Auth connection required to verify account credentials.');

    found.lastLoginAt = new Date().toISOString();
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

    if (found.defaultWorkspaceId) {
      WorkspaceService.setActiveWorkspaceId(found.defaultWorkspaceId);
    }

    const session: AuthSession = {
      accessToken: `mock_jwt_${Date.now()}`,
      expiresAt: Date.now() + 86400 * 7 * 1000,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        businessName: found.businessName,
        role: found.role,
        currency: found.currency,
        theme: found.theme,
        emailVerified: found.emailVerified,
        mustChangePassword: Boolean(found.mustChangePassword),
        firstLoginCompleted: Boolean(found.firstLoginCompleted),
        defaultWorkspaceId: found.defaultWorkspaceId,
        createdAt: found.createdAt,
        lastLoginAt: found.lastLoginAt,
      },
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));
    return { session, user: session.user };
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
