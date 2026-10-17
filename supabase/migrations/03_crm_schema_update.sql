-- ====================================================================
-- CHERRYFLOW V1 - CRM SCHEMA UPDATE MIGRATION
-- Migration: 03_crm_schema_update.sql
-- Description: Adds address, website, industry, source, assigned_user,
--              favorite, archived, and tags columns to customers table.
--              Also creates customer_timelines table for interaction logs.
-- ====================================================================

-- 1. Extend public.customers table with CRM profile fields
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Direct',
  ADD COLUMN IF NOT EXISTS assigned_user TEXT DEFAULT 'Owner',
  ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Create customer_timelines table for storing timeline events & interaction logs
CREATE TABLE IF NOT EXISTS public.customer_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'note', 'status_change', 'email', 'call', 'created', 'deal_update'
  title TEXT NOT NULL,
  description TEXT,
  author TEXT DEFAULT 'User',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Additional performance indexes for CRM querying
CREATE INDEX IF NOT EXISTS idx_customers_owner_status ON public.customers(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_owner_archived ON public.customers(owner_id, archived);
CREATE INDEX IF NOT EXISTS idx_customers_owner_favorite ON public.customers(owner_id, favorite);
CREATE INDEX IF NOT EXISTS idx_customers_owner_industry ON public.customers(owner_id, industry);
CREATE INDEX IF NOT EXISTS idx_customer_timelines_customer_id ON public.customer_timelines(customer_id, created_at DESC);

-- 4. Enable RLS on customer_timelines
ALTER TABLE public.customer_timelines ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for customer_timelines
DROP POLICY IF EXISTS "Users can manage own customer timelines" ON public.customer_timelines;
CREATE POLICY "Users can manage own customer timelines"
  ON public.customer_timelines
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
