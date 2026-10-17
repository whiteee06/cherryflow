-- ====================================================================
-- CHERRYFLOW OS V1.0 - TEAM INVITATIONS, ROLES & PERMISSIONS SCHEMA
-- ====================================================================

-- 1. WORKSPACE ROLES TABLE
CREATE TABLE IF NOT EXISTS public.workspace_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Roles
INSERT INTO public.workspace_roles (id, name, description)
VALUES
  ('owner', 'Workspace Owner', 'Full Access, Billing, Team Management, Workspace Settings, Delete Workspace'),
  ('admin', 'Admin', 'Manage Customers, Manage Tasks, Manage Team, View Reports'),
  ('manager', 'Manager', 'Assign Tasks, Manage Projects, View Analytics'),
  ('employee', 'Employee', 'View Assigned Tasks, Update Own Tasks, View Customers'),
  ('viewer', 'Viewer', 'Read-only Access')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. WORKSPACE PERMISSIONS MATRIX TABLE
CREATE TABLE IF NOT EXISTS public.workspace_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT NOT NULL REFERENCES public.workspace_roles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_key)
);

-- Seed Permissions
INSERT INTO public.workspace_permissions (role_id, permission_key, description)
VALUES
  -- Owner
  ('owner', 'manage_workspace', 'Full control over workspace settings & deletion'),
  ('owner', 'manage_billing', 'Billing and subscription management'),
  ('owner', 'manage_team', 'Invite, edit, suspend, and remove team members'),
  ('owner', 'manage_customers', 'Full customer CRM access'),
  ('owner', 'manage_tasks', 'Full task management access'),
  ('owner', 'view_reports', 'Full analytics and reports access'),
  -- Admin
  ('admin', 'manage_team', 'Invite and manage team members'),
  ('admin', 'manage_customers', 'Full customer CRM access'),
  ('admin', 'manage_tasks', 'Full task management access'),
  ('admin', 'view_reports', 'View analytics and reports'),
  -- Manager
  ('manager', 'assign_tasks', 'Assign tasks and manage projects'),
  ('manager', 'manage_projects', 'Create and manage project pipelines'),
  ('manager', 'view_analytics', 'View team performance analytics'),
  -- Employee
  ('employee', 'view_assigned_tasks', 'View assigned tasks'),
  ('employee', 'update_own_tasks', 'Update status on assigned tasks'),
  ('employee', 'view_customers', 'View customer details'),
  -- Viewer
  ('viewer', 'view_only', 'Read-only view access')
ON CONFLICT (role_id, permission_key) DO NOTHING;

-- 3. ENSURE EXTENDED COLUMNS ON WORKSPACE MEMBERS
ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Update status constraint to include 'suspended'
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_status_check;
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_status_check CHECK (status IN ('active', 'inactive', 'invited', 'suspended'));

-- 4. ENSURE EXTENDED COLUMNS ON WORKSPACE INVITATIONS
ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Update invitation status constraint to include 'cancelled'
ALTER TABLE public.workspace_invitations DROP CONSTRAINT IF EXISTS workspace_invitations_status_check;
ALTER TABLE public.workspace_invitations ADD CONSTRAINT workspace_invitations_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled'));

-- 5. INVITATION LOGS AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.invitation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'sent', 'accepted', 'cancelled', 'expired'
  performed_by UUID,
  performed_by_email TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEAM MEMBERS UNIFIED VIEW
CREATE OR REPLACE VIEW public.team_members AS
SELECT 
  wm.id,
  wm.workspace_id,
  wm.user_id,
  wm.name,
  wm.email,
  wm.avatar_url,
  wm.role,
  wm.status,
  wm.mobile_number,
  wm.department,
  wm.job_title,
  wm.joined_at,
  w.name AS workspace_name
FROM public.workspace_members wm
JOIN public.workspaces w ON wm.workspace_id = w.id;

-- ENABLE RLS
ALTER TABLE public.workspace_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ROLES & PERMISSIONS
CREATE POLICY "Anyone authenticated can view roles"
  ON public.workspace_roles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can view permissions"
  ON public.workspace_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS POLICIES FOR INVITATION LOGS
CREATE POLICY "Workspace members can view invitation logs"
  ON public.invitation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = invitation_logs.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert invitation logs"
  ON public.invitation_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
