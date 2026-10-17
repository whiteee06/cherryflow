-- ====================================================================
-- CHERRYFLOW OS V1.1 - SINGLE SUPER ADMIN DATABASE MIGRATION
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL CHECK (username = 'whiteee06'),
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role = 'super_admin'),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Locked', 'Suspended')),
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Restrict all public access by default
CREATE POLICY "Super Admins access restricted to verified auth context"
  ON public.super_admins
  FOR ALL
  USING (false);

-- Insert Primary Super Admin Record if not existing
-- Default bcrypt hash for password "Ch1@Er2@"
INSERT INTO public.super_admins (username, password_hash, role, status)
VALUES (
  'whiteee06',
  '$2a$10$3p4KjP9vE2mJz8sQ2z5hX.zJ7e2R9y2e8Q2z5hX.zJ7e2R9y2e8Q2', -- Bcrypt hash placeholder
  'super_admin',
  'Active'
)
ON CONFLICT (username) DO NOTHING;

-- Trigger to prevent any second Super Admin creation
CREATE OR REPLACE FUNCTION prevent_extra_super_admins()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.super_admins) >= 1 THEN
    RAISE EXCEPTION 'CherryFlow System Constraint: Only ONE Super Admin account (whiteee06) can exist in the platform.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_super_admin ON public.super_admins;
CREATE TRIGGER enforce_single_super_admin
BEFORE INSERT ON public.super_admins
FOR EACH ROW
EXECUTE FUNCTION prevent_extra_super_admins();
