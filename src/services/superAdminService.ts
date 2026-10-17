export interface SuperAdminAuthResult {
  success: boolean;
  token?: string;
  error?: string;
  isLocked?: boolean;
  remainingSeconds?: number;
  attemptsLeft?: number;
  superAdmin?: {
    username: string;
    role: string;
    status: string;
    lastLoginAt?: string;
  };
}

export interface SuperAdminAuditItem {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
}

const JWT_STORAGE_KEY = 'cherryflow_superadmin_jwt';
const SESSION_STORAGE_KEY = 'cherryflow_superadmin_session';

export class SuperAdminService {
  /**
   * Get stored JWT token
   */
  static getToken(): string | null {
    return localStorage.getItem(JWT_STORAGE_KEY);
  }

  /**
   * Save JWT token and session
   */
  static saveSession(token: string, superAdminInfo: any) {
    localStorage.setItem(JWT_STORAGE_KEY, token);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(superAdminInfo));
  }

  /**
   * Get stored Super Admin session details
   */
  static getSession(): { username: string; role: string; status: string; lastLoginAt?: string } | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear session
   */
  static clearSession() {
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  /**
   * Check if Super Admin is currently logged in locally
   */
  static isSuperAdminLoggedIn(): boolean {
    const token = this.getToken();
    return Boolean(token);
  }

  /**
   * Authenticate Super Admin via API
   */
  static async login(username: string, password: string, rememberMe: boolean = false): Promise<SuperAdminAuthResult> {
    try {
      const response = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Authentication failed.',
          isLocked: Boolean(data.isLocked),
          remainingSeconds: data.remainingSeconds,
          attemptsLeft: data.attemptsLeft,
        };
      }

      if (data.token) {
        this.saveSession(data.token, data.superAdmin);
      }

      return {
        success: true,
        token: data.token,
        superAdmin: data.superAdmin,
      };
    } catch (err: any) {
      console.warn('Network error calling /api/super-admin/login:', err);
      // Fallback for local sandbox if backend is offline - verify via SHA-256 hash so plaintext credentials are never revealed
      const cleanUser = (username || '').trim().toLowerCase();
      let passHash = '';
      try {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
          const msgBuffer = new TextEncoder().encode(password);
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          passHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        }
      } catch {
        // Subtle crypto error fallback
      }

      const DEV_PASS_SHA256 = '4d20b217970ff733515516d579fbe37c32d47577caa4fb72f2feba5bf8e435c1';

      if (cleanUser === 'cherry_06' && passHash === DEV_PASS_SHA256) {
        const mockToken = `sa_jwt_root_${Date.now()}`;
        const mockAdmin = {
          username: 'cherry_06',
          role: 'super_admin',
          status: 'Active',
          lastLoginAt: new Date().toISOString(),
        };
        this.saveSession(mockToken, mockAdmin);
        return {
          success: true,
          token: mockToken,
          superAdmin: mockAdmin,
        };
      } else {
        return {
          success: false,
          error: 'Invalid super admin credentials.',
        };
      }
    }
  }

  /**
   * Verify active session token with backend
   */
  static async verifySession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/super-admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const data = await response.json();
      return Boolean(data.valid);
    } catch {
      // In offline preview mode, allow existing valid local token
      return true;
    }
  }

  /**
   * Get Super Admin Account Status & Lockout State
   */
  static async getStatus() {
    try {
      const res = await fetch('/api/super-admin/status');
      return await res.json();
    } catch {
      return {
        username: 'cherry_06',
        role: 'super_admin',
        status: 'Active',
        failedAttempts: 0,
        maxFailedAttempts: 5,
        isLocked: false,
      };
    }
  }

  /**
   * Log out Super Admin
   */
  static async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/super-admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    this.clearSession();
  }

  /**
   * Fetch Super Admin Audit Logs
   */
  static async getAuditLogs(): Promise<SuperAdminAuditItem[]> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/super-admin/audit-logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  }

  /**
   * Record a Super Admin Action in Audit Log
   */
  static async addAuditLog(action: string, details: string) {
    const token = this.getToken();
    try {
      await fetch('/api/super-admin/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, details }),
      });
    } catch (err) {
      console.warn('Failed to post audit log:', err);
    }
  }
}
