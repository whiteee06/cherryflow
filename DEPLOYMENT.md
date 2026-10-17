# 🚀 CherryFlow OS – Production Deployment Guide (Vercel & Supabase)

This document details how to deploy CherryFlow OS to production using **Vercel** for the frontend/edge runtime and **Supabase** for database, authentication, and file storage.

---

## 🏗️ 1. Supabase Database & Storage Deployment

### Step 1.1: Create a New Supabase Project
1. Log into [Supabase](https://supabase.com).
2. Click **New Project**, select your organization, name the project `cherryflow-production`, and set a strong database password.
3. Select your preferred AWS region.

### Step 1.2: Run SQL Migrations
Using the Supabase CLI or the SQL Editor in the Supabase Dashboard:

```bash
# Link local repository to your Supabase project ID
npx supabase link --project-ref <your-project-ref>

# Push all 9 schema migrations
npx supabase db push

# (Optional) Seed initial plans and demo data
npx supabase db execute --file supabase/seed.sql
```

Alternatively, copy and paste each SQL file in `supabase/migrations/` (`01_initial_schema.sql` through `09_notifications_automation_schema.sql`) into the Supabase SQL Editor.

### Step 1.3: Enable Storage Buckets & Policies
Ensure the following storage buckets are created in Supabase Storage with public access enabled for avatars:
- `avatars` (Public bucket, max 5MB per file)
- `task-attachments` (Private bucket with workspace RLS policies, max 25MB per file)

---

## ⚡ 2. Vercel Frontend Deployment

### Step 2.1: Connect GitHub Repository to Vercel
1. Log into [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your `cherryflow-os` GitHub repository.

### Step 2.2: Configure Environment Variables in Vercel
In the Vercel project deployment settings, add the following Environment Variables under **Production**:

| Key | Value | Scope |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Server / Build |
| `GEMINI_API_KEY` | `AIzaSyYourProductionGeminiKey` | Server-side only |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production Client |
| `VITE_SUPABASE_ANON_KEY` | `your-production-anon-key` | Production Client |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | CI/CD / Migrations |
| `JWT_SECRET` | `minimum-32-character-random-secret` | Server-side only |

### Step 2.3: Build Settings Verification
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Click **Deploy**. Vercel will process `vercel.json` and deploy your app.

---

## 🔄 3. CI/CD GitHub Actions Setup

To enable automated deployments on every `git push main`:

1. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
2. Add the following repository secrets:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VERCEL_TOKEN` (Generated from Vercel Account Settings > Access Tokens)
   - `VERCEL_ORG_ID` (Found in `vercel/project.json` or Vercel Team settings)
   - `VERCEL_PROJECT_ID` (Found in Vercel Project Settings)

Now every Pull Request triggers linting, type-checking, unit tests, and a Vercel Preview Deployment. Pushing to `main` deploys directly to Production!

---

## 🛡️ 4. Post-Deployment Verification Checklist

- [x] Test `https://your-domain.com/api/health` returns status `healthy`.
- [x] Test AI Copilot and AI Streaming chat endpoints.
- [x] Verify PWA service worker installs (`/sw.js`).
- [x] Test Supabase user login and database operations.
- [x] Check security headers via `https://securityheaders.com`.
