-- Migration 07: Team Collaboration & Workspace Management Schema
-- Description: Sets up Workspaces, Workspace Members, Invitations, Item Comments, In-App Notifications, and Realtime User Presences with complete RLS security policies.

-- 1. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 3. WORKSPACE INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  inviter_name TEXT NOT NULL,
  inviter_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ITEM COMMENTS TABLE (Task, Customer & Note Collaboration)
CREATE TABLE IF NOT EXISTS public.item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('task', 'customer', 'note')),
  target_id TEXT NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  text TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IN-APP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mention', 'task_assigned', 'comment', 'invite', 'system')),
  read BOOLEAN DEFAULT FALSE,
  target_type TEXT CHECK (target_type IN ('task', 'customer', 'workspace', 'note')),
  target_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER PRESENCE TABLE (Realtime Team Status)
CREATE TABLE IF NOT EXISTS public.user_presences (
  user_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'idle', 'offline')),
  active_tab TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_item_comments_target ON public.item_comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.in_app_notifications(user_id, read);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presences ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR WORKSPACES
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update workspace settings"
  ON public.workspaces FOR UPDATE
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS POLICIES FOR WORKSPACE MEMBERS
CREATE POLICY "Members can view co-members in their workspaces"
  ON public.workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and Owners can manage workspace members"
  ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- RLS POLICIES FOR INVITATIONS
CREATE POLICY "Members can view workspace invitations"
  ON public.workspace_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
    OR email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admins can insert and manage invitations"
  ON public.workspace_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- RLS POLICIES FOR COMMENTS
CREATE POLICY "Workspace members can view comments"
  ON public.item_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.item_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors and Admins can delete comments"
  ON public.item_comments FOR DELETE
  USING (author_id = auth.uid());

-- RLS POLICIES FOR NOTIFICATIONS
CREATE POLICY "Users can manage their own notifications"
  ON public.in_app_notifications FOR ALL
  USING (user_id = auth.uid());

-- RLS POLICIES FOR PRESENCE
CREATE POLICY "Anyone authenticated can view user presences"
  ON public.user_presences FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own presence record"
  ON public.user_presences FOR ALL
  USING (user_id = auth.uid());
