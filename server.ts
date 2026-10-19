import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import superAdminRouter from './server/superAdmin';
import teamAuthRouter from './server/teamAuthRouter';
import integrationGuideRouter from './server/integrationGuideRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security Middleware: Set Security Headers
app.use((req, res, next) => {
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; worker-src 'self' blob:;"
  );
  next();
});

// Helper: Resolve Allowed Origins for Production CORS Enforcement
function getAllowedProductionOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS || process.env.APP_URL || '';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0 && o !== '*');
}

// Enable Hardened CORS Middleware for API requests
app.use('/api', (req, res, next) => {
  const requestOrigin = req.headers.origin as string | undefined;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development / Preview mode: Allow request origin or wildcard for preview environments
    const devOrigin = requestOrigin || '*';
    res.setHeader('Access-Control-Allow-Origin', devOrigin);
    if (requestOrigin) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-user-email, x-user-role');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  }

  // Production Mode: Strict Origin Verification
  const allowedOrigins = getAllowedProductionOrigins();

  // If request has no Origin header (e.g. same-origin request or server-to-server HTTP client)
  if (!requestOrigin) {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  }

  // Request has an Origin header: Check against allowed production origins list
  const isAllowed = allowedOrigins.includes(requestOrigin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-user-email, x-user-role');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  }

  // Disallowed Origin in Production
  if (req.method === 'OPTIONS') {
    return res.status(403).json({
      error: 'CORS policy violation: Preflight origin not allowed in production.',
      origin: requestOrigin,
    });
  }

  return res.status(403).json({
    error: 'CORS policy violation: Request origin not allowed in production.',
    origin: requestOrigin,
  });
});

// Parse Body
app.use(express.json({ limit: '10mb' }));

// In-Memory Diagnostics & Security Log Store
interface DiagnosticLog {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  ip: string;
}

const systemLogs: DiagnosticLog[] = [];
let totalRequestsHandled = 0;
const serverStartTime = Date.now();

// Simple Rate Limiting Store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const RATE_LIMIT_MAX_REQUESTS = 300;

app.use((req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);

  if (record.count > RATE_LIMIT_MAX_REQUESTS && req.path.startsWith('/api/')) {
    return res.status(429).json({
      error: 'Too many requests. Rate limit exceeded. Please try again later.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  // Request logging & metrics middleware
  const start = Date.now();
  totalRequestsHandled += 1;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    if (req.path.startsWith('/api/')) {
      systemLogs.unshift({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.path,
        status: res.statusCode,
        durationMs,
        ip,
      });
      if (systemLogs.length > 100) systemLogs.pop();
    }
  });

  next();
});

// Super Admin Authentication & Management API Routes
app.use('/api/super-admin', superAdminRouter);

// Team Member Creation & Authentication Management Routes
app.use('/api/team', teamAuthRouter);

// Integration Guide Role-Based API Routes
app.use('/api/integration-guide', integrationGuideRouter);

// DevOps Diagnostics & System Monitoring Endpoints
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL);

  res.json({
    status: 'healthy',
    app: 'CherryFlow OS',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    services: {
      supabase: hasSupabaseUrl ? 'connected' : 'mock_local_mode',
      storage: 'ready',
    },
    memory: {
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
    },
  });
});

app.get('/api/metrics', (req, res) => {
  res.json({
    totalRequestsHandled,
    activeRateLimitRecords: rateLimitMap.size,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    memoryUsageMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
    nodeVersion: process.version,
    pid: process.pid,
  });
});

app.get('/api/logs', (req, res) => {
  res.json({
    totalLogs: systemLogs.length,
    logs: systemLogs,
  });
});

// Simulated DevOps Backup Trigger
app.post('/api/devops/backup', (req, res) => {
  const backupId = `bkp_${Date.now()}`;
  res.json({
    success: true,
    backupId,
    status: 'completed',
    timestamp: new Date().toISOString(),
    sizeMb: 14.8,
    location: 's3://cherryflow-backups-prod/db_daily_snapshots/',
    tablesIncluded: ['customers', 'tasks', 'notes', 'profiles', 'activities', 'workspaces', 'plans', 'automation_workflows'],
  });
});

// Validate Production CORS Configuration on Server Startup
function validateProductionCorsConfig() {
  if (process.env.NODE_ENV === 'production') {
    const raw = process.env.ALLOWED_ORIGINS || process.env.APP_URL || '';
    if (!raw.trim()) {
      throw new Error(
        '[FATAL] Production CORS Startup Guard: ALLOWED_ORIGINS or APP_URL environment variable must be explicitly set in production.'
      );
    }
    if (raw.includes('*')) {
      throw new Error(
        '[FATAL] Production CORS Startup Guard: ALLOWED_ORIGINS cannot contain wildcards (*) in production.'
      );
    }
    const origins = getAllowedProductionOrigins();
    if (origins.length === 0) {
      throw new Error(
        '[FATAL] Production CORS Startup Guard: No valid HTTP/HTTPS origins resolved from ALLOWED_ORIGINS.'
      );
    }
  }
}

let serverInstance: any;

// Setup Vite development server or serve static files in production
async function startServer() {
  validateProductionCorsConfig();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`CherryFlow Enterprise Backend running on http://0.0.0.0:${PORT}`);
  });
}

// Process-level resilience & Graceful Shutdown for Cloud Run
function gracefulShutdown(signal: string) {
  console.log(`[Server] ${signal} signal received. Draining connections...`);
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('[Server] HTTP server closed cleanly.');
      process.exit(0);
    });
    setTimeout(() => {
      console.warn('[Server] Forcefully shutting down process after timeout.');
      process.exit(1);
    }, 8000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
