import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthSession, AuthScreen } from '../types';
import { AuthService } from '../services/authService';
import { TeamService } from '../services/TeamService';
import { SuperAdminService } from '../services/superAdminService';
import { isSupabaseConfigured } from '../lib/supabase';
import { LoginFormData, RegisterFormData } from '../features/auth/schemas';

interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  screen: AuthScreen;
  setScreen: (screen: AuthScreen) => void;
  inviteToken: string | null;
  setInviteToken: (token: string | null) => void;
  isSupabaseConfigured: boolean;
  pendingVerificationEmail: string | null;
  error: string | null;
  setError: (err: string | null) => void;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (password: string) => Promise<void>;
  completePasswordChange: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<string>;
  switchUserRole: (newRole: 'owner' | 'admin' | 'member') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screen, setScreen] = useState<AuthScreen>('landing');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount (Auto Login / Session Restoration)
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        if (SuperAdminService.isSuperAdminLoggedIn()) {
          const saUser: UserProfile = {
            id: 'sa_01_cherry_06',
            name: 'Developer (cherry_06)',
            email: 'cherry_06@cherryflow.io',
            businessName: 'CherryFlow Developer Root Control',
            role: 'super_admin',
            currency: '$',
            theme: 'dark',
            createdAt: '2026-01-01T00:00:00.000Z',
          };
          setUser(saUser);
          setSession({
            accessToken: SuperAdminService.getToken() || 'sa_jwt_active',
            expiresAt: Date.now() + 86400000,
            user: saUser,
          });
          setScreen('app');
          setIsLoading(false);
          return;
        }

        const existingSession = await AuthService.getSession();
        if (existingSession && existingSession.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          if (existingSession.user.mustChangePassword) {
            setScreen('force_password_change');
          } else {
            setScreen('app'); // Automatically enter app when valid session exists
          }
        } else {
          // Check window pathname or hash for super admin routes
          const path = window.location.pathname;
          const hash = window.location.hash;

          if (path.includes('/super-admin/login') || hash === '#super-admin-login') {
            setScreen('super_admin_login');
          } else if (path.includes('/super-admin') || hash === '#super-admin') {
            setScreen('super_admin_login');
          } else if (hash === '#login') {
            setScreen('login');
          } else if (hash === '#register') {
            setScreen('register');
          } else if (hash === '#reset-password') {
            setScreen('reset_password');
          } else {
            setScreen('landing');
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Route / Hash Listener for Super Admin Navigation
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.includes('/super-admin/login') || hash === '#super-admin-login') {
        setScreen('super_admin_login');
      } else if (path.includes('/super-admin') || hash === '#super-admin') {
        if (SuperAdminService.isSuperAdminLoggedIn()) {
          setScreen('app');
        } else {
          setScreen('unauthorized');
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const login = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await AuthService.signIn(data);
      setSession(result.session);
      setUser(result.user);
      if (result.user.mustChangePassword) {
        setScreen('force_password_change');
      } else {
        setScreen('app');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completePasswordChange = async (newPassword: string) => {
    if (!user) throw new Error('No active user session.');
    setError(null);
    setIsLoading(true);
    try {
      await TeamService.completePasswordChange(user.email, newPassword);
      const updatedUser = { ...user, mustChangePassword: false, firstLoginCompleted: true };
      setUser(updatedUser);
      if (session) {
        setSession({ ...session, user: updatedUser });
      }
      setScreen('app');
    } catch (err: any) {
      setError(err.message || 'Failed to update temporary password.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await AuthService.signUp(data);
      if (result.requiresVerification) {
        setPendingVerificationEmail(data.email);
        setScreen('verify_email');
      } else if (result.session && result.user) {
        setSession(result.session);
        setUser(result.user);
        setScreen('app');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      const msg = await AuthService.forgotPassword(email);
      return msg;
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
      throw err;
    }
  };

  const resetPassword = async (password: string) => {
    setError(null);
    try {
      await AuthService.resetPassword(password);
      if (user) {
        setScreen('app');
      } else {
        setScreen('login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      SuperAdminService.logout();
      setUser(null);
      setSession(null);
      setScreen('login');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!pendingVerificationEmail) throw new Error('No pending email address to verify.');
    return AuthService.resendVerification(pendingVerificationEmail);
  };

  const switchUserRole = (newRole: 'owner' | 'admin' | 'member') => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    if (session) {
      setSession({ ...session, user: updatedUser });
    }
  };

  const isSuperAdminActive = SuperAdminService.isSuperAdminLoggedIn();

  return (
    <AuthContext.Provider
      value={{
        user: isSuperAdminActive
          ? {
              id: 'sa_01_cherry_06',
              name: 'Developer (cherry_06)',
              email: 'cherry_06@cherryflow.io',
              businessName: 'CherryFlow Developer Root Control',
              role: 'super_admin',
              currency: '$',
              theme: 'dark',
              createdAt: '2026-01-01T00:00:00.000Z',
            }
          : user,
        session,
        isAuthenticated: Boolean((user && session) || isSuperAdminActive),
        isLoading,
        screen,
        setScreen,
        inviteToken,
        setInviteToken,
        isSupabaseConfigured,
        pendingVerificationEmail,
        error,
        setError,
        login,
        register,
        forgotPassword,
        resetPassword,
        completePasswordChange,
        logout,
        resendVerification,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
