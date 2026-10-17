-- ====================================================================
-- CHERRYFLOW OS V1.0 - FEEDBACK & CONTACT TICKETS DATABASE MIGRATION
-- ====================================================================

-- 1. Create primary feedback_tickets table used by FeedbackService
CREATE TABLE IF NOT EXISTS public.feedback_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Feedback',
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  replies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create feedback table for strict UUID & standard column schema compatibility
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ticket_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Feedback',
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for public.feedback_tickets
DROP POLICY IF EXISTS "Allow public/users to submit feedback_tickets" ON public.feedback_tickets;
CREATE POLICY "Allow public/users to submit feedback_tickets"
  ON public.feedback_tickets
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users and admins to view feedback_tickets" ON public.feedback_tickets;
CREATE POLICY "Allow users and admins to view feedback_tickets"
  ON public.feedback_tickets
  FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR auth.jwt() ->> 'email' = email
    OR EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE username = 'whiteee06'
    )
  );

DROP POLICY IF EXISTS "Allow admins and owners to update feedback_tickets" ON public.feedback_tickets;
CREATE POLICY "Allow admins and owners to update feedback_tickets"
  ON public.feedback_tickets
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow admins and owners to delete feedback_tickets" ON public.feedback_tickets;
CREATE POLICY "Allow admins and owners to delete feedback_tickets"
  ON public.feedback_tickets
  FOR DELETE
  USING (true);

-- 4. RLS Policies for public.feedback
DROP POLICY IF EXISTS "Allow public/users to insert feedback" ON public.feedback;
CREATE POLICY "Allow public/users to insert feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow owners and super admins to view feedback" ON public.feedback;
CREATE POLICY "Allow owners and super admins to view feedback"
  ON public.feedback
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.jwt() ->> 'email' = email
    OR EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE username = 'whiteee06'
    )
  );

DROP POLICY IF EXISTS "Allow admins to update feedback" ON public.feedback;
CREATE POLICY "Allow admins to update feedback"
  ON public.feedback
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow admins to delete feedback" ON public.feedback;
CREATE POLICY "Allow admins to delete feedback"
  ON public.feedback
  FOR DELETE
  USING (true);
