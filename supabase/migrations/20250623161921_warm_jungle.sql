/*
  # Fix avatar storage bucket and RLS policies

  1. Storage
    - Create `avatars` bucket for user profile pictures
    - Enable public access for avatars
    - Set up proper RLS policies for avatar uploads

  2. Security
    - Users can upload their own avatars
    - Avatars are publicly readable
    - Proper folder structure validation
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
-- The name should start with their user ID
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (
    name LIKE (auth.uid()::text || '/%') 
    OR name LIKE (auth.uid()::text || '-%')
    OR name = auth.uid()::text
  )
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (
    name LIKE (auth.uid()::text || '/%') 
    OR name LIKE (auth.uid()::text || '-%')
    OR name = auth.uid()::text
  )
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (
    name LIKE (auth.uid()::text || '/%') 
    OR name LIKE (auth.uid()::text || '-%')
    OR name = auth.uid()::text
  )
);