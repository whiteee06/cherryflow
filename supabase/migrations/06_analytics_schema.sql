-- Migration 06: Analytics & Scheduled Reports Schema
-- Creates scheduled_reports and analytics_snapshots tables

CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Executive Weekly Digest',
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  recipients TEXT[] DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'email')),
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  total_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  active_customers INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  notes_created INTEGER DEFAULT 0,
  pipeline_value NUMERIC DEFAULT 0,
  ai_sessions_count INTEGER DEFAULT 0,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own scheduled_reports"
  ON public.scheduled_reports FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own analytics_snapshots"
  ON public.analytics_snapshots FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);
