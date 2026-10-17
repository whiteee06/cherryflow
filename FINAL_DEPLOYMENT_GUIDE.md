# 🚀 CherryFlow OS – Final Production Launch & Deployment Manual

This guide provides the complete, end-to-end instructions for launching **CherryFlow OS v1.0.0** into a live production environment on Vercel, Supabase, Google Cloud Run, or custom Docker infrastructure.

---

## 📋 1. Pre-Flight Production Checklist

Before executing the launch command, verify the following baseline requirements:

- [x] **Node.js Environment**: Node v20.x or higher with npm v10+.
- [x] **Code Validation**: `npm run lint` completes with zero errors.
- [x] **Test Verification**: `npm test` executes and passes all test suites.
- [x] **Build Verification**: `npm run build` compiles `dist/` and `dist/server.cjs` cleanly.
- [x] **API Key Security**: Ensure `GEMINI_API_KEY` is defined as a server-side environment variable only.

---

## 🗄️ 2. Supabase Infrastructure Setup

1. **Create Supabase Project**:
   - Go to [https://supabase.com](https://supabase.com) and create a new project named `cherryflow-production`.
   - Record your `Project URL` and `anon public key` from **Project Settings > API**.

2. **Execute Database Migrations**:
   Run the 9 SQL migration files in order in the Supabase SQL Editor or via CLI:
   - `01_initial_schema.sql` (Workspaces, Users, Profiles, RLS)
   - `02_storage_setup.sql` (Storage buckets & security policies)
   - `03_crm_schema_update.sql` (Customers, deals, activities)
   - `04_tasks_schema_update.sql` (Tasks, subtasks, attachments)
   - `05_ai_chat_schema.sql` (Chat sessions & message history)
   - `06_analytics_schema.sql` (Reports & analytics data)
   - `07_team_collaboration_schema.sql` (Workspace members & invites)
   - `08_billing_subscription_schema.sql` (Plans & invoices)
   - `09_notifications_automation_schema.sql` (Notifications & workflows)

3. **Seed Initial Reference Data**:
   Execute `supabase/seed.sql` to populate default plan tiers and workspace configurations.

---

## ⚡ 3. Deploying to Vercel (Edge & Express Serverless)

1. **Connect Repository**:
   - Import `cherryflow-os` into Vercel.
2. **Environment Variables Configuration**:
   Add the following in Vercel Project Settings:
   ```env
   NODE_ENV="production"
   GEMINI_API_KEY="AIzaSyYourProductionGeminiKey"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   JWT_SECRET="super-secret-random-32-character-string"
   ```
3. **Build Rules**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**: Click **Deploy**. Vercel will process `vercel.json` and host the application globally.

---

## 🐳 4. Deploying via Cloud Run / Docker Container

If hosting on GCP Cloud Run or custom Kubernetes cluster:

1. **Build Container Image**:
   ```bash
   docker build -t gcr.io/your-project-id/cherryflow:v1.0.0 .
   ```
2. **Push to Container Registry**:
   ```bash
   docker push gcr.io/your-project-id/cherryflow:v1.0.0
   ```
3. **Deploy Service**:
   Set target port to `3000` and inject environment variables via Secret Manager.

---

## 🔍 5. Post-Launch Verification & Telemetry Checks

After deployment completes:
1. Access `https://your-domain.com/api/health` to confirm server status `healthy`.
2. Access `https://your-domain.com/api/metrics` to verify telemetry tracking.
3. Test AI Copilot chat streaming on the live site.
4. Verify PWA installation prompt in Chrome/Safari.

---

## 🍒 CherryFlow v2.0 Strategic Roadmap

Looking beyond v1.0, here is the suggested feature expansion roadmap for CherryFlow v2.0:

1. **Native Stripe Billing Integration**: Direct webhooks for live credit card processing and tier upgrades.
2. **Multi-Model AI Switcher**: Option to toggle between Gemini 3.6 Flash, Claude 3.5 Sonnet, and OpenAI GPT-4o.
3. **Real-time Collaboration (WebSockets)**: Live cursor sharing and multi-user document editing in Notes and Kanban boards.
4. **Custom Integrations Marketplace**: Zapier, Slack, HubSpot, and Google Calendar 2-way sync plugins.
5. **Mobile Native Apps**: React Native iOS & Android companion applications utilizing the existing API layer.
