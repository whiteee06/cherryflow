import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Super Admin Configuration Constants
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'cherry_06';
// Bcrypt hash for developer password (@amirthachinnathambi06)
const SUPER_ADMIN_PASSWORD_HASH = process.env.SUPER_ADMIN_PASSWORD_HASH || '$2b$10$qX.yX9cpGyzluhrWUpQAP.OjONyqdEXrFJVucJtW86XiZR9XRWVNK';

const JWT_SECRET = process.env.JWT_SECRET || 'cherryflow_superadmin_secret_key_v1.1_enterprise';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-Memory Super Admin State
interface SuperAdminState {
  id: string;
  username: string;
  role: 'super_admin';
  status: 'Active' | 'Locked' | 'Suspended';
  failedAttempts: number;
  lockedUntil: number | null;
  createdAt: string;
  updatedAt: string;
}

const superAdminAccountState: SuperAdminState = {
  id: 'sa_01_cherry_06',
  username: SUPER_ADMIN_USERNAME,
  role: 'super_admin',
  status: 'Active',
  failedAttempts: 0,
  lockedUntil: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

// In-Memory Audit Log Engine
export interface SuperAdminAuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: 'Login' | 'Logout' | 'Failed Login' | 'Settings Changes' | 'User Management' | 'Billing Changes' | 'System Changes';
  details: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
}

const auditLogsStore: SuperAdminAuditLog[] = [
  {
    id: 'aud_init_01',
    timestamp: new Date().toISOString(),
    username: SUPER_ADMIN_USERNAME,
    action: 'System Changes',
    details: 'Developer Super Admin root security policy initialised for cherry_06',
    ipAddress: '127.0.0.1',
    deviceInfo: 'CherryFlow Developer Kernel v1.1',
    status: 'SUCCESS',
  },
];

// Helper: Extract Device & User Agent Info
function parseUserAgent(req: Request): string {
  const ua = req.headers['user-agent'] || 'Unknown Browser';
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari')) return 'Safari Browser';
  return 'Desktop Client / Node API';
}

// Helper: Get Client IP
function getClientIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
}

// Middleware: Authenticate Super Admin JWT Token
export function verifySuperAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({
      error: '403 Forbidden: Super Admin authentication token missing or invalid.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    if (decoded.username.toLowerCase() !== SUPER_ADMIN_USERNAME.toLowerCase() || decoded.role !== 'super_admin') {
      return res.status(403).json({
        error: '403 Forbidden: Developer Super Admin privileges required.',
      });
    }

    (req as any).superAdmin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: '403 Forbidden: Session expired or invalid token. Please log in again.',
    });
  }
}

// -------------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------------

/**
 * POST /api/super-admin/login
 * Handles Super Admin authentication with bcrypt & lockout
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ip = getClientIp(req);
  const device = parseUserAgent(req);
  const now = Date.now();

  // 1. Check Lockout Status
  if (superAdminAccountState.lockedUntil && now < superAdminAccountState.lockedUntil) {
    const remainingSec = Math.ceil((superAdminAccountState.lockedUntil - now) / 1000);
    const remainingMin = Math.ceil(remainingSec / 60);

    auditLogsStore.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: username || 'unknown',
      action: 'Failed Login',
      details: `Attempt blocked. Account locked for ${remainingMin} more minutes.`,
      ipAddress: ip,
      deviceInfo: device,
      status: 'FAILED',
    });

    return res.status(423).json({
      error: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMin} minute(s).`,
      isLocked: true,
      remainingSeconds: remainingSec,
    });
  }

  // Clear expired lockout
  if (superAdminAccountState.lockedUntil && now >= superAdminAccountState.lockedUntil) {
    superAdminAccountState.lockedUntil = null;
    superAdminAccountState.failedAttempts = 0;
    superAdminAccountState.status = 'Active';
  }

  // 2. Validate Username
  const normalizedUsername = (username || '').trim().toLowerCase();
  if (!normalizedUsername || normalizedUsername !== SUPER_ADMIN_USERNAME.toLowerCase()) {
    superAdminAccountState.failedAttempts += 1;

    auditLogsStore.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: username || 'invalid_user',
      action: 'Failed Login',
      details: `Invalid username attempt: "${username}". Attempt ${superAdminAccountState.failedAttempts} of ${MAX_FAILED_ATTEMPTS}.`,
      ipAddress: ip,
      deviceInfo: device,
      status: 'FAILED',
    });

    if (superAdminAccountState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      superAdminAccountState.lockedUntil = now + LOCKOUT_DURATION_MS;
      superAdminAccountState.status = 'Locked';
      return res.status(423).json({
        error: 'Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.',
        isLocked: true,
        remainingSeconds: 900,
      });
    }

    return res.status(401).json({
      error: 'Invalid super admin credentials.',
      attemptsLeft: MAX_FAILED_ATTEMPTS - superAdminAccountState.failedAttempts,
    });
  }

  // 3. Validate Password with Bcrypt
  const isPasswordValid = bcrypt.compareSync(password || '', SUPER_ADMIN_PASSWORD_HASH);

  if (!isPasswordValid) {
    superAdminAccountState.failedAttempts += 1;

    auditLogsStore.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: SUPER_ADMIN_USERNAME,
      action: 'Failed Login',
      details: `Invalid password supplied. Attempt ${superAdminAccountState.failedAttempts} of ${MAX_FAILED_ATTEMPTS}.`,
      ipAddress: ip,
      deviceInfo: device,
      status: 'FAILED',
    });

    if (superAdminAccountState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      superAdminAccountState.lockedUntil = now + LOCKOUT_DURATION_MS;
      superAdminAccountState.status = 'Locked';
      return res.status(423).json({
        error: 'Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.',
        isLocked: true,
        remainingSeconds: 900,
      });
    }

    return res.status(401).json({
      error: `Invalid super admin credentials. ${MAX_FAILED_ATTEMPTS - superAdminAccountState.failedAttempts} attempt(s) remaining before account lockout.`,
      attemptsLeft: MAX_FAILED_ATTEMPTS - superAdminAccountState.failedAttempts,
    });
  }

  // 4. Successful Login
  superAdminAccountState.failedAttempts = 0;
  superAdminAccountState.lockedUntil = null;
  superAdminAccountState.status = 'Active';
  superAdminAccountState.updatedAt = new Date().toISOString();

  // Issue Signed JWT Token valid for 24 hours
  const token = jwt.sign(
    {
      sub: superAdminAccountState.id,
      username: SUPER_ADMIN_USERNAME,
      role: 'super_admin',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  auditLogsStore.unshift({
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: SUPER_ADMIN_USERNAME,
    action: 'Login',
    details: 'Super Admin authenticated successfully via secure gateway.',
    ipAddress: ip,
    deviceInfo: device,
    status: 'SUCCESS',
  });

  return res.json({
    message: 'Super Admin authentication successful.',
    token,
    superAdmin: {
      username: SUPER_ADMIN_USERNAME,
      role: 'super_admin',
      status: 'Active',
      lastLoginAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/super-admin/logout
 */
router.post('/logout', verifySuperAdminMiddleware, (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const device = parseUserAgent(req);

  auditLogsStore.unshift({
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: SUPER_ADMIN_USERNAME,
    action: 'Logout',
    details: 'Super Admin session terminated cleanly.',
    ipAddress: ip,
    deviceInfo: device,
    status: 'SUCCESS',
  });

  return res.json({ message: 'Logged out successfully.' });
});

/**
 * GET /api/super-admin/verify
 */
router.get('/verify', verifySuperAdminMiddleware, (req: Request, res: Response) => {
  return res.json({
    valid: true,
    superAdmin: {
      username: SUPER_ADMIN_USERNAME,
      role: 'super_admin',
      status: superAdminAccountState.status,
    },
  });
});

/**
 * GET /api/super-admin/status
 */
router.get('/status', (req: Request, res: Response) => {
  const now = Date.now();
  const isLocked = Boolean(superAdminAccountState.lockedUntil && now < superAdminAccountState.lockedUntil);
  const remainingSec = isLocked && superAdminAccountState.lockedUntil ? Math.ceil((superAdminAccountState.lockedUntil - now) / 1000) : 0;

  return res.json({
    username: SUPER_ADMIN_USERNAME,
    role: 'super_admin',
    status: isLocked ? 'Locked' : superAdminAccountState.status,
    failedAttempts: superAdminAccountState.failedAttempts,
    maxFailedAttempts: MAX_FAILED_ATTEMPTS,
    isLocked,
    remainingLockoutSeconds: remainingSec,
  });
});

/**
 * GET /api/super-admin/audit-logs
 */
router.get('/audit-logs', verifySuperAdminMiddleware, (req: Request, res: Response) => {
  return res.json({ logs: auditLogsStore });
});

/**
 * POST /api/super-admin/audit-log
 */
router.post('/audit-log', verifySuperAdminMiddleware, (req: Request, res: Response) => {
  const { action, details } = req.body;
  if (!action || !details) {
    return res.status(400).json({ error: 'Action and details are required.' });
  }

  const logItem: SuperAdminAuditLog = {
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: SUPER_ADMIN_USERNAME,
    action,
    details,
    ipAddress: getClientIp(req),
    deviceInfo: parseUserAgent(req),
    status: 'SUCCESS',
  };

  auditLogsStore.unshift(logItem);
  return res.json({ success: true, log: logItem });
});

export default router;
