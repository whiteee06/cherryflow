# 📜 CherryFlow OS – Version Changelog

All notable changes to the CherryFlow Business Operating System project are documented in this file.

---

## [1.0.0-GA] - 2026-08-06

### Added
- **Core Architecture**: Express + Vite TypeScript hybrid full-stack application setup with ESBuild CJS bundler.
- **Supabase Integration**: 9 SQL migration scripts covering multi-tenant workspaces, RLS policies, customers, tasks, notes, AI chat history, analytics, billing, and automations.
- **Executive Dashboard**: Interactive KPI metrics, revenue velocity charts, and activity feeds.
- **CRM Module**: Kanban deal boards, table filters, customer modal, CSV exports, and 1-click AI outreach email generation.
- **Task Management**: Drag-and-drop task pipelines, subtasks, priority indicators, and AI task breakdown decomposition.
- **Notes & Knowledge Base**: Markdown editor, tag filtering, pinned notes, and AI note summarization.
- **AI Assistant**: Streaming SSE server route (`/api/ai/chat/stream`), Gemini 3.6 Flash integration, and contextual business copilot.
- **Automation Builder**: Node-based trigger/action workflow creator with execution telemetry.
- **Billing & Subscriptions**: Plan tier selection, downloadable invoices, tax configuration, and simulated payment processing.
- **Team & Workspaces**: Workspace switcher, invitation token generator, RBAC roles (`Owner`, `Admin`, `Member`, `Guest`).
- **Super Admin & DevOps**: System diagnostics dashboard, user impersonation mode, global feature flags, audit trail logs, live server logs, and automated database backups.
- **PWA & Offline**: Web app manifest, service worker (`sw.js`), favicon suite, and offline fallback banner.
- **Error Boundaries**: Client-side React ErrorBoundary component with system recovery options.
- **Automated Test Suite**: Unit and integration test runner (`run-tests.ts` via `npm test`).

### Improved
- **Mobile Responsiveness**: Touch-optimized bottom navigation bar, mobile sidebar drawers, and fluid typography.
- **Security & Headers**: Added HSTS, CSP, X-Frame-Options, rate limiting middleware, and server-side API key isolation.
- **TypeScript & Linting**: 100% strict type check compliance with zero compilation errors.
