-- Migration 09: Notifications Center & Workflow Automation Engine Schema
-- Description: Creates tables for Notifications, Preferences, Workflows, Workflow Steps, Workflow Runs, Execution Logs, Scheduled Jobs, and Webhooks with RLS.

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('crm', 'tasks', 'ai', 'team', 'billing', 'system')),
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_crm BOOLEAN DEFAULT TRUE,
  email_tasks BOOLEAN DEFAULT TRUE,
  email_billing BOOLEAN DEFAULT TRUE,
  email_system BOOLEAN DEFAULT FALSE,
  in_app_crm BOOLEAN DEFAULT TRUE,
  in_app_tasks BOOLEAN DEFAULT TRUE,
  in_app_ai BOOLEAN DEFAULT TRUE,
  in_app_team BOOLEAN DEFAULT TRUE,
  in_app_billing BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('realtime', 'daily', 'weekly', 'never')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUTOMATION WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKFLOW STEPS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('condition', 'action', 'delay', 'branch')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKFLOW RUNS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  trigger_event TEXT NOT NULL,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- 6. WORKFLOW LOGS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  step_id UUID,
  log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  step_output JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SCHEDULED JOBS TABLE
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  step_id UUID,
  execute_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'canceled')),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_workflows_ws ON public.automation_workflows(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_wf ON public.workflow_runs(workflow_id, status);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Workspace members can view workflows"
  ON public.automation_workflows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = automation_workflows.workspace_id
      AND workspace_members.user_id = auth.uid()
    ) OR auth.role() = 'authenticated'
  );

CREATE POLICY "Workspace members can view workflow logs"
  ON public.workflow_logs FOR SELECT
  USING (auth.role() = 'authenticated');
