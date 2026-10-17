# 🛡️ CherryFlow OS – Enterprise Security & Compliance Checklist

This document details the security controls, policy standards, data privacy measures, and threat mitigations implemented across CherryFlow OS.

---

## 🔒 1. Network & HTTP Security Headers

- [x] **Strict Transport Security (HSTS)**:
  `max-age=63072000; includeSubDomains; preload` header applied to all responses to enforce HTTPS connections.
- [x] **Content Security Policy (CSP)**:
  Restrict script sources (`'self'`), style sources, and API connect endpoints (`https://*.supabase.co`, `https://generativelanguage.googleapis.com`).
- [x] **X-Content-Type-Options**: `nosniff` prevents MIME-type sniffing attacks.
- [x] **X-Frame-Options**: `SAMEORIGIN` prevents clickjacking framing attacks.
- [x] **Referrer-Policy**: `strict-origin-when-cross-origin` protects user privacy during external link navigation.
- [x] **Permissions-Policy**: Camera, microphone, and geolocation disabled by default (`camera=(), microphone=(), geolocation=()`).

---

## 🔑 2. Secrets & API Key Protection

- [x] **Gemini API Key Isolation**: The `GEMINI_API_KEY` is strictly server-side (`server.ts`). It is never exposed to the client bundle or browser DOM.
- [x] **Public vs Private Keys**: Only variables prefixed with `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are exposed to the client browser.
- [x] **Environment Variable Hygiene**: All credentials declared in `.env.example`. Secrets manager integration supported for Cloud Run and Vercel.

---

## 🛑 3. Rate Limiting & Input Validation

- [x] **Rate Limiting**: Built-in memory store limits requests to 300 requests per 15 minutes per IP address on all `/api/*` endpoints.
- [x] **Input Sanitization**: `zod` schemas validate incoming API payloads and customer data structures before processing.
- [x] **SQL Injection Mitigation**: All Supabase database queries utilize parameterized queries via `@supabase/supabase-js` or ORM abstractions.
- [x] **XSS Prevention**: React automatically escapes rendering content; Markdown output is rendered securely via `react-markdown`.

---

## 🗄️ 4. Database Access & Multi-Tenancy Security

- [x] **Supabase Row Level Security (RLS)**:
  `workspace_id` isolation ensures users can only query and mutate data belonging to their active workspace.
- [x] **Role-Based Access Control (RBAC)**:
  - **Owner**: Full workspace management, billing access, deletion permissions.
  - **Admin**: Member management, automations, team workflows.
  - **Member**: Standard CRUD access to customers, tasks, and notes.
  - **Guest**: Read-only access to assigned projects and tasks.
- [x] **Audit Trail Logging**:
  All super admin operations (impersonation, feature flag changes, status overrides) are recorded in the system audit log (`audit_logs`).

---

## 💾 5. Data Backup & Disaster Recovery

- [x] **Automated S3/Supabase Snapshots**: Daily automated database backups with 30-day retention policy.
- [x] **Point-in-Time Recovery (PITR)**: Write-Ahead Logging (WAL) enabled on Supabase Postgres.
- [x] **Client-Side Fallback Resiliency**: Local storage state sync ensures zero data loss during network dropouts or database service downtime.
