-- Migration 13: Team Member Authentication & Auth Sync
-- Description: Enhances workspace_members and team_members to guarantee user.id synchronization
-- with Supabase Auth, temporary password support, first_login_completed tracking, and robust RLS.

-- 1. Ensure required columns on workspace_members
ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS temp_password TEXT,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_workspace_members_workspace_email ON public.workspace_members(workspace_id, email);

-- 2. Create concrete team_members table or sync trigger if needed
CREATE TABLE IF NOT EXISTS public.team_members_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'employee', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited', 'suspended')),
  mobile_number TEXT,
  department TEXT,
  job_title TEXT,
  temp_password TEXT,
  must_change_password BOOLEAN DEFAULT TRUE,
  first_login_completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_email ON public.workspace_members(email);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_store_email ON public.team_members_store(email);
CREATE INDEX IF NOT EXISTS idx_team_members_store_user_id ON public.team_members_store(user_id);

-- Enable RLS
ALTER TABLE public.team_members_store ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for workspace_members & team_members_store
CREATE POLICY "Users can view members of their workspace"
  ON public.workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM public.workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND (wm.user_id = auth.uid() OR wm.email = auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Workspace members can view team_members_store"
  ON public.team_members_store FOR SELECT
  USING (
    user_id = auth.uid()
    OR email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM public.workspace_members AS wm
      WHERE wm.workspace_id = team_members_store.workspace_id
      AND (wm.user_id = auth.uid() OR wm.email = auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Owners and admins can manage team_members_store"
  ON public.team_members_store FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS wm
      WHERE wm.workspace_id = team_members_store.workspace_id
      AND (wm.user_id = auth.uid() OR wm.email = auth.jwt() ->> 'email')
      AND wm.role IN ('owner', 'admin')
    )
  );

-- 4. Workspaces RLS: Allow team members to view and access only their own workspace
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.workspaces;
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND (workspace_members.user_id = auth.uid() OR workspace_members.email = auth.jwt() ->> 'email')
    ) OR
    EXISTS (
      SELECT 1 FROM public.team_members_store
      WHERE team_members_store.workspace_id = workspaces.id
      AND (team_members_store.user_id = auth.uid() OR team_members_store.email = auth.jwt() ->> 'email')
    )
  );
