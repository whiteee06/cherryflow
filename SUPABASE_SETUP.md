# 🍒 CherryFlow V1 – Supabase Database & Backend Setup Guide

This document provides step-by-step instructions for provisioning, configuring, and verifying your production Supabase database for CherryFlow V1.

---

## 📋 Table of Contents
1. [Overview](#1-overview)
2. [Step 1: Create Database Tables & RLS Policies](#step-1-create-database-tables--rls-policies)
3. [Step 2: Configure Supabase Storage Buckets](#step-2-configure-supabase-storage-buckets)
4. [Step 3: Connect Environment Variables](#step-3-connect-environment-variables)
5. [Step 4: Verify CRUD Operations & RLS](#step-4-verify-crud-operations--rls)
6. [Architecture & Services Overview](#architecture--services-overview)

---

## 1. Overview

CherryFlow V1 comes with a scalable PostgreSQL schema managed via Supabase. It features:
- **5 Core Database Tables**: `profiles`, `customers`, `tasks`, `notes`, `activities`.
- **Foreign Keys**: Linked to `auth.users(id)` with `ON DELETE CASCADE`.
- **Row Level Security (RLS)**: Enforced per user (`auth.uid() = owner_id`).
- **Performance Indexes**: High-speed lookups on status, search terms, and dates.
- **Automated Triggers**: `updated_at` auto-updates and automatic user profile creation upon signup.
- **Supabase Storage**: `avatars` bucket with 5MB upload limit and image MIME restrictions.

---

## Step 1: Create Database Tables & RLS Policies

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select or create your project.
3. Open the **SQL Editor** from the left navigation bar.
4. Click **New Query**.
5. Copy the contents of `/supabase/migrations/01_initial_schema.sql` from this project repository and paste them into the SQL Editor.
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).

> **What this executes:**
> - Enables `uuid-ossp` extension.
> - Creates `profiles`, `customers`, `tasks`, `notes`, and `activities` tables with Foreign Keys.
> - Enables RLS on all 5 tables and applies `auth.uid()` security policies for SELECT, INSERT, UPDATE, and DELETE.
> - Creates automated `handle_updated_at()` and `handle_new_user()` trigger functions.
> - Creates indexes (`idx_customers_owner_id`, `idx_tasks_status`, etc.) for query optimization.

---

## Step 2: Configure Supabase Storage Buckets

1. Stay in the Supabase **SQL Editor** or open a new query.
2. Copy the contents of `/supabase/migrations/02_storage_setup.sql` from this project repository.
3. Paste and click **Run**.

> **What this executes:**
> - Provisions the `avatars` public storage bucket.
> - Restricts file size limit to **5 MB**.
> - Enforces MIME type checks (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`).
> - Adds RLS policies allowing public reads and restricted authenticated uploads under `{userId}/avatar_filename`.

---

## Step 3: Connect Environment Variables

1. Go to your Supabase Project Settings -> **API**.
2. Copy your **Project URL** and **`anon` public key**.
3. In AI Studio / Settings -> **Secrets**, add or set the following environment variables:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
4. Restart your application dev server or reload the preview.

---

## Step 4: Verify CRUD Operations & RLS

### A. Testing User Registration & Profile Creation
1. Go to the CherryFlow App in preview.
2. Click **Register** and create a new account.
3. Check the Supabase **Table Editor** -> `profiles` table. You will see a newly inserted profile record corresponding to your `auth.users` ID.

### B. Testing Customer CRM CRUD
1. Navigate to the **Customers** tab.
2. Click **Add Customer** and fill in details.
3. Check Supabase **Table Editor** -> `customers` table. The row will appear with `owner_id` set to your authenticated user UUID.
4. Edit or delete the customer. The database record will immediately update or drop.

### C. Testing Task Management CRUD
1. Navigate to the **Tasks** tab.
2. Create a task with priority, title, and due date.
3. Toggle the task complete/todo checkbox. The `status` field in Supabase `tasks` table updates automatically.

### D. Testing Notes Management CRUD
1. Navigate to the **Notes** tab.
2. Add a new note and edit its title or content. Changes synchronize with Supabase `notes` table.

### E. Testing Storage Uploads
1. Go to **Settings** -> **Profile**.
2. Click **Upload Avatar** and select an image file (`< 5MB`).
3. Check Supabase **Storage** -> `avatars` bucket. You will see the uploaded avatar under your user folder `{userId}/avatar_...`.

### F. Verifying RLS Isolation
1. Sign out and create a second test user account.
2. Log into User #2.
3. Observe that User #2 cannot see any customers, tasks, or notes created by User #1.
4. RLS guarantees strict multi-tenant data isolation at the PostgreSQL engine level!

---

## Architecture & Services Overview

The codebase provides reusable frontend services in `/src/services/`:
- `ProfileService`: Fetches/updates profiles and handles avatar uploads to storage.
- `CustomerService`: Handles full CRM customer operations (get, search, filter, create, update, delete).
- `TaskService`: Handles task management and status toggling.
- `NoteService`: Handles notes management and category/text search.
- `ActivityService`: Logs system and user audit activities.

*Note: All services feature automatic failover to client storage when Supabase is not configured, guaranteeing uninterrupted UI responsiveness during development.*
