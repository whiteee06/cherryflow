-- ====================================================================
-- CHERRYFLOW V1 - STORAGE BUCKETS & POLICIES MIGRATION
-- Migration: 02_storage_setup.sql
-- Description: Configures Supabase storage bucket for user avatars and attachments
--              with Row Level Security policies.
-- ====================================================================

-- Create avatars storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB Limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Enable RLS on storage.objects (Supabase system table)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- STORAGE POLICIES FOR AVATARS BUCKET
-- --------------------------------------------------------------------

-- Policy 1: Allow public read access to all avatars
DROP POLICY IF EXISTS "Public Avatar Read Access" ON storage.objects;
CREATE POLICY "Public Avatar Read Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Authenticated User Avatar Upload" ON storage.objects;
CREATE POLICY "Authenticated User Avatar Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Allow authenticated users to update their own avatar
DROP POLICY IF EXISTS "Authenticated User Avatar Update" ON storage.objects;
CREATE POLICY "Authenticated User Avatar Update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Allow authenticated users to delete their own avatar
DROP POLICY IF EXISTS "Authenticated User Avatar Delete" ON storage.objects;
CREATE POLICY "Authenticated User Avatar Delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
