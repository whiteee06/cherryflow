-- ====================================================================
-- CHERRYFLOW V1 - TASK & PROJECT MANAGEMENT SCHEMA UPDATE MIGRATION
-- Migration: 04_tasks_schema_update.sql
-- Description: Enhances tasks table with start_date, assigned_user,
--              labels, subtasks, recurring, reminders, attachments,
--              comments, activity_history, favorite, archived, FKs, RLS and indexes.
-- ====================================================================

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assigned_user TEXT DEFAULT 'Owner',
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recurring TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS activity_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create Performance Indexes for Task Queries
CREATE INDEX IF NOT EXISTS idx_tasks_owner_status ON public.tasks(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_archived ON public.tasks(owner_id, archived);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_priority ON public.tasks(owner_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Ensure RLS Policies on Tasks Table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = owner_id);

-- Storage bucket for Task Attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated users to upload task attachments" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload task attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access to task attachments" ON storage.objects;
CREATE POLICY "Allow public read access to task attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-attachments');

DROP POLICY IF EXISTS "Allow users to delete own task attachments" ON storage.objects;
CREATE POLICY "Allow users to delete own task attachments" ON storage.objects
  FOR DELETE USING (bucket_id = 'task-attachments' AND auth.uid() = owner);
