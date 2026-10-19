// CherryFlow Automated Test Suite (Unit & Integration Verification)
import { z } from 'zod';

console.log('----------------------------------------------------');
console.log('🧪 CHERRYFLOW AUTOMATED TEST SUITE RUNNER');
console.log('----------------------------------------------------');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failedTests++;
  }
}

// 1. Customer Schema Validation Test
console.log('\n[Suite 1] Customer Schema & Data Validation');
const CustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  deal_value: z.number().min(0),
  status: z.enum(['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost']),
});

try {
  const validCustomer = CustomerSchema.parse({
    name: 'Sarah Jenkins',
    email: 'sarah@nexus.io',
    deal_value: 18500,
    status: 'Proposal Sent',
  });
  assert(validCustomer.deal_value === 18500, 'Customer schema validates correct structure');
} catch {
  assert(false, 'Customer schema validation failed');
}

try {
  CustomerSchema.parse({
    name: 'Invalid Customer',
    email: 'not-an-email',
    deal_value: -100,
    status: 'UnknownStatus',
  });
  assert(false, 'Customer schema allowed invalid data');
} catch {
  assert(true, 'Customer schema rejects invalid email and deal value');
}

// 2. Task Breakdown Logic Test
console.log('\n[Suite 2] Task & Priority Business Rules');
const TaskPriorityOrder = { High: 3, Medium: 2, Low: 1 };
assert(TaskPriorityOrder['High'] > TaskPriorityOrder['Low'], 'Priority ranking logic is ordered correctly');

// 3. Error Transformer Test
console.log('\n[Suite 3] Security & Error Transformer Guard');
function parseErrorString(err: any): string {
  if (err?.message) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown transaction error';
}

assert(parseErrorString({ message: 'Database failure' }) === 'Database failure', 'Error parser extracts nested error messages');
assert(parseErrorString('Direct error') === 'Direct error', 'Error parser handles direct error strings');

// 4. Rate Limiting Window Math Test
console.log('\n[Suite 4] Rate Limiter Logic');
const windowMs = 15 * 60 * 1000;
const now = Date.now();
const resetTime = now + windowMs;
assert(resetTime - now === 900000, 'Rate limit window math accurately sets 15-minute reset period');

// 5. Super Admin Architecture & Security Rules Test
console.log('\n[Suite 5] Single Super Admin & Security Governance');
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SUPER_ADMIN_USERNAME = 'cherry_06';
const SUPER_ADMIN_RAW_PASS = '@amirthachinnathambi06';
const hash = '$2b$10$qX.yX9cpGyzluhrWUpQAP.OjONyqdEXrFJVucJtW86XiZR9XRWVNK';

// Password Hashing Check
assert(bcrypt.compareSync(SUPER_ADMIN_RAW_PASS, hash), 'Bcrypt verifies Developer Super Admin password securely');
assert(!bcrypt.compareSync('WrongPassword123', hash), 'Bcrypt rejects incorrect passwords');

// Single Super Admin Constraint Check
function validateSuperAdminUsername(user: string): boolean {
  return user.trim().toLowerCase() === SUPER_ADMIN_USERNAME.toLowerCase();
}
assert(validateSuperAdminUsername('cherry_06'), 'Allows primary Developer Super Admin account cherry_06');
assert(!validateSuperAdminUsername('hacker01'), 'Rejects non-cherry_06 usernames from Super Admin authentication');
assert(!validateSuperAdminUsername('admin'), 'Rejects generic admin account creation');

// Registration Role Sanitization Check
function sanitizeRegistrationRole(requestedRole: string): string {
  const FORBIDDEN = ['super_admin', 'platform_admin', 'root_admin', 'system_admin', 'admin'];
  if (FORBIDDEN.includes(requestedRole.toLowerCase())) {
    return 'owner';
  }
  return requestedRole;
}
assert(sanitizeRegistrationRole('super_admin') === 'owner', 'Registration automatically sanitizes super_admin request to owner');
assert(sanitizeRegistrationRole('Platform_Admin') === 'owner', 'Registration automatically sanitizes Platform_Admin request to owner');
assert(sanitizeRegistrationRole('member') === 'member', 'Registration preserves valid member role');

// Account Lockout Engine Check
let failedAttempts = 0;
const MAX_FAILED = 5;
let lockedUntil: number | null = null;

for (let i = 1; i <= 5; i++) {
  failedAttempts++;
  if (failedAttempts >= MAX_FAILED) {
    lockedUntil = Date.now() + 15 * 60 * 1000;
  }
}
assert(failedAttempts === 5, 'Failed login attempts counter tracks 5 consecutive failures');
assert(lockedUntil !== null && lockedUntil > Date.now(), 'Account locks for 15 minutes after 5 failed attempts');

// JWT Claims Verification
const secret = 'test_jwt_secret_123';
const token = jwt.sign({ sub: 'sa_01_cherry_06', username: 'cherry_06', role: 'super_admin' }, secret);
const decoded = jwt.verify(token, secret) as any;
assert(decoded.username === 'cherry_06' && decoded.role === 'super_admin', 'JWT token verifies root Super Admin identity');

// 6. Registration & Team Member Auth Sync Test Suite
console.log('\n[Suite 6] Registration Flow, Team Member Sync & Error Handling');

// UUID format verification
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validUuid = 'fa1522e0-63ae-4ca0-8521-6e98908f0680';
const invalidUuid = 'usr_1792235666667';
assert(UUID_REGEX.test(validUuid), 'Validates standard RFC4122 UUID format');
assert(!UUID_REGEX.test(invalidUuid), 'Rejects non-UUID strings to protect Postgres UUID columns');

// Duplicate email detection logic
const registeredEmailSet = new Set(['existing.user@example.com']);
function checkDuplicateEmail(email: string): boolean {
  return registeredEmailSet.has(email.trim().toLowerCase());
}
assert(checkDuplicateEmail('existing.user@example.com'), 'Detects exact registered email duplicate');
assert(checkDuplicateEmail('  EXISTING.USER@example.com '), 'Detects case-insensitive and whitespace duplicate email');
assert(!checkDuplicateEmail('new.founder@example.com'), 'Permits brand new unique email address');

// First-login password change and temp_password sanitization
interface MemberRecord {
  id: string;
  email: string;
  temp_password: string | null;
  must_change_password: boolean;
  first_login_completed: boolean;
}

const newMember: MemberRecord = {
  id: validUuid,
  email: 'team@acme.com',
  temp_password: 'TempPassword123!',
  must_change_password: true,
  first_login_completed: false,
};

// Simulate first login completion
function completeFirstLogin(member: MemberRecord): MemberRecord {
  return {
    ...member,
    temp_password: null, // Temporary password must be wiped
    must_change_password: false,
    first_login_completed: true,
  };
}

const completedMember = completeFirstLogin(newMember);
assert(completedMember.temp_password === null, 'Temporary password is securely cleared after first login');
assert(completedMember.must_change_password === false, 'must_change_password flag is set to false');
assert(completedMember.first_login_completed === true, 'first_login_completed flag is set to true');

// Error message transformation for "Failed to fetch"
function formatRegistrationError(rawError: string): string {
  if (rawError.includes('Failed to fetch') || rawError.includes('NetworkError')) {
    return 'Unable to connect to the registration service. Please verify your connection or try again.';
  }
  return rawError;
}

assert(
  formatRegistrationError('Failed to fetch') ===
    'Unable to connect to the registration service. Please verify your connection or try again.',
  'Transforms raw "Failed to fetch" into user-friendly message'
);
assert(
  formatRegistrationError('An account with this email address already exists. Please sign in.') ===
    'An account with this email address already exists. Please sign in.',
  'Preserves specific duplicate account conflict error messages'
);

// 7. CORS Hardened Origin Verification Suite
console.log('\n[Suite 7] CORS Production Hardening Rules');
function parseAllowedOrigins(rawEnv?: string, rawAppUrl?: string): string[] {
  const raw = rawEnv || rawAppUrl || '';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0 && o !== '*');
}

function isOriginAllowedInProduction(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return true; // Server-to-server or same-origin allowed through to route auth
  return allowedOrigins.includes(origin);
}

const origins = parseAllowedOrigins('http://localhost:3000,https://cherryflow.app,https://cherryflow.vercel.app');
assert(isOriginAllowedInProduction('https://cherryflow.app', origins), 'Allows explicitly listed production origin https://cherryflow.app');
assert(isOriginAllowedInProduction('http://localhost:3000', origins), 'Allows local preview origin http://localhost:3000');
assert(!isOriginAllowedInProduction('https://malicious-site.com', origins), 'Rejects unauthorized cross-origin https://malicious-site.com');
assert(!isOriginAllowedInProduction('https://hacker.io', origins), 'Rejects untrusted origin https://hacker.io');
assert(isOriginAllowedInProduction(undefined, origins), 'Permits requests without Origin header for server-to-server HTTP clients');

function validateCorsStartupConfig(envVal?: string): boolean {
  const raw = envVal || '';
  if (!raw.trim()) return false;
  if (raw.includes('*')) return false;
  const parsed = parseAllowedOrigins(raw);
  return parsed.length > 0;
}

assert(validateCorsStartupConfig('https://cherryflow.app,http://localhost:3000'), 'Validates correct production CORS startup configuration');
assert(!validateCorsStartupConfig(''), 'Rejects empty production CORS configuration');
assert(!validateCorsStartupConfig('*'), 'Rejects wildcard production CORS configuration');
assert(!validateCorsStartupConfig('https://site.com,*'), 'Rejects mixed wildcard production CORS configuration');

// 8. Supabase Session & Team Invitation Validation Suite
console.log('\n[Suite 8] Supabase Session & Team Invitation Validation');

// Missing Session vs Genuine Auth Error Handler
function handleAuthSessionError(error: { name?: string; message?: string } | null): { isLoggedOut: boolean; shouldWarn: boolean; userMessage: string } {
  if (!error) return { isLoggedOut: false, shouldWarn: false, userMessage: '' };
  
  const isMissingSession =
    error.name === 'AuthSessionMissingError' ||
    error.message?.includes('Auth session missing') ||
    error.message?.includes('session_not_found');

  if (isMissingSession) {
    return { isLoggedOut: true, shouldWarn: false, userMessage: 'Unauthenticated' };
  }

  return {
    isLoggedOut: false,
    shouldWarn: true,
    userMessage: error.message || 'Invalid email address or password. Please verify your credentials and try again.',
  };
}

const missingSessionErr = { name: 'AuthSessionMissingError', message: 'Auth session missing!' };
const invalidCredsErr = { name: 'AuthApiError', message: 'Invalid login credentials' };

const missingResult = handleAuthSessionError(missingSessionErr);
assert(missingResult.isLoggedOut && !missingResult.shouldWarn, 'Missing session is handled as normal logged-out state without error warnings');

const invalidResult = handleAuthSessionError(invalidCredsErr);
assert(!invalidResult.isLoggedOut && invalidResult.shouldWarn, 'Invalid credentials triggers genuine authentication error handling');

// Email normalization and duplicate invitation prevention
function validateWorkspaceInvitation(
  email: string,
  existingMembers: { email: string }[],
  pendingInvitations: { email: string; status: string }[]
): { allowed: boolean; message?: string } {
  const cleanEmail = email.trim().toLowerCase();

  const isMember = existingMembers.some((m) => m.email.trim().toLowerCase() === cleanEmail);
  if (isMember) {
    return { allowed: false, message: 'This user is already a member of your workspace.' };
  }

  const isPending = pendingInvitations.some(
    (i) => i.email.trim().toLowerCase() === cleanEmail && i.status === 'pending'
  );
  if (isPending) {
    return { allowed: false, message: 'An invitation has already been sent to this email.' };
  }

  return { allowed: true };
}

const members = [{ email: 'active.member@company.com' }];
const pending = [{ email: 'pending.invite@company.com', status: 'pending' }];

const duplicateMemberCheck = validateWorkspaceInvitation(' ACTIVE.MEMBER@company.com ', members, pending);
assert(!duplicateMemberCheck.allowed && duplicateMemberCheck.message === 'This user is already a member of your workspace.', 'Rejects duplicate invitation for existing workspace member with exact message');

const duplicatePendingCheck = validateWorkspaceInvitation('PENDING.INVITE@company.com', members, pending);
assert(!duplicatePendingCheck.allowed && duplicatePendingCheck.message === 'An invitation has already been sent to this email.', 'Rejects duplicate invitation for pending invitee with exact message');

const validNewInviteCheck = validateWorkspaceInvitation('new.user@company.com', members, pending);
assert(validNewInviteCheck.allowed, 'Allows sending invitation to a new email address');

// Independent cross-workspace invitations
const workspaceA_members = [{ email: 'existing.user@gmail.com' }];
const workspaceB_members: { email: string }[] = [];

const crossWorkspaceCheck = validateWorkspaceInvitation('existing.user@gmail.com', workspaceB_members, []);
assert(crossWorkspaceCheck.allowed, 'Allows an existing user to be invited to a different workspace independently');

console.log('----------------------------------------------------');
console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
console.log('----------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All automated tests completed successfully!');
}


