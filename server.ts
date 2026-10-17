import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import superAdminRouter from './server/superAdmin';
import teamAuthRouter from './server/teamAuthRouter';
import integrationGuideRouter from './server/integrationGuideRouter';

dotenv.config();

const app = express();
const PORT = 3000;

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com; worker-src 'self' blob:;"
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

// Lazy initialization of GoogleGenAI SDK
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Super Admin Authentication & Management API Routes
app.use('/api/super-admin', superAdminRouter);

// Team Member Creation & Authentication Management Routes
app.use('/api/team', teamAuthRouter);

// Integration Guide Role-Based API Routes
app.use('/api/integration-guide', integrationGuideRouter);

// AI Service API Routes
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are CherryFlow AI, a world-class business copilot and strategic advisor for small business owners, agency directors, and freelancers.
Provide concise, practical, actionable advice. Use markdown formatting with bullet points and bold headers when helpful.
Context provided by user: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/copilot:', error);
    return res.status(500).json({ error: error.message || 'Failed to process AI request.' });
  }
});

app.post('/api/ai/outreach', async (req, res) => {
  try {
    const { customerName, company, status, dealValue, notes, objective } = req.body;
    if (!customerName) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Write a highly professional, friendly, and convincing outreach email for a client named "${customerName}" at "${company || 'their organization'}".
Details:
- Current Status: ${status || 'Lead'}
- Deal Value: $${dealValue || 0}
- Objective: ${objective || 'Follow up on project proposal and schedule a discovery call'}
- Notes/Context: ${notes || 'No extra notes provided.'}

Provide a subject line and email body. Format nicely with markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert sales and client communication strategist for modern businesses.',
        temperature: 0.7,
      },
    });

    return res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/outreach:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate outreach.' });
  }
});

app.post('/api/ai/task-breakdown', async (req, res) => {
  try {
    const { taskTitle, description, priority } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Break down the business task "${taskTitle}" (Priority: ${priority || 'Medium'}, Details: ${description || 'None'}) into 3 to 5 clear, actionable sub-steps with estimated time duration in minutes. Return a JSON array of subtasks, where each item has "title" (string) and "estimatedMinutes" (number).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const jsonText = response.text ? response.text.trim() : '[]';
    const subtasks = JSON.parse(jsonText);
    return res.json({ subtasks });
  } catch (error: any) {
    console.error('Error in /api/ai/task-breakdown:', error);
    return res.status(500).json({ error: error.message || 'Failed to breakdown task.' });
  }
});

app.post('/api/ai/note-summary', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Note content is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Analyze and format the following business note titled "${title || 'Untitled Note'}":
${content}

Provide:
1. Executive Summary (2-3 key takeaways)
2. Action Items (List of clear tasks derived from note)
3. Key Decisions Made

Use clear markdown headings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an executive assistant summarizing business meetings and strategy notes.',
        temperature: 0.5,
      },
    });

    return res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/note-summary:', error);
    return res.status(500).json({ error: error.message || 'Failed to summarize note.' });
  }
});

// AI Chat Streaming Endpoint
app.post('/api/ai/chat/stream', async (req, res) => {
  try {
    const { message, history, model, temperature, systemPrompt } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ai = getGeminiClient();
    const selectedModel = model || 'gemini-3.6-flash';
    const temp = typeof temperature === 'number' ? temperature : 0.7;
    const sysInstruction =
      systemPrompt ||
      'You are CherryFlow AI Business Assistant, an expert business copilot helping founders, agency leaders, and sales directors grow their business.';

    let contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: contents,
      config: {
        systemInstruction: sysInstruction,
        temperature: temp,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in /api/ai/chat/stream:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Streaming failed.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream error occurred.' })}\n\n`);
      res.end();
    }
  }
});

// DevOps Diagnostics & System Monitoring Endpoints
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL);

  res.json({
    status: 'healthy',
    app: 'CherryFlow OS',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    services: {
      geminiAi: hasGeminiKey ? 'configured' : 'missing_key',
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CherryFlow Enterprise Backend running on http://0.0.0.0:${PORT}`);
  });
}

// Process-level resilience against crashes
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
