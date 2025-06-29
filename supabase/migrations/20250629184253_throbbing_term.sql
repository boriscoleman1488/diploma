/*
  # Fix Storage RLS Policies for Image Uploads

  1. Security Changes
    - Add proper RLS policies for storage buckets
    - Allow users to upload images to avatars and dish-images buckets
    - Ensure users can only access their own images

  2. Changes
    - Create storage policies for avatars bucket
    - Create storage policies for dish-images bucket
    - Allow authenticated users to upload and manage their own images
*/

-- Create storage policies for avatars bucket
BEGIN;
  -- First check if the bucket exists
  DO $$
  DECLARE
    bucket_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'avatars'
    ) INTO bucket_exists;
    
    IF bucket_exists THEN
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Allow public read access" ON storage.objects FOR SELECT;
      DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects FOR INSERT;
      DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects FOR UPDATE;
      DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects FOR DELETE;
      
      -- Create new policies
      CREATE POLICY "Allow public read access to avatars"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'avatars');
        
      CREATE POLICY "Allow authenticated users to upload avatars"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'avatars' AND
          auth.role() = 'authenticated'
        );
        
      CREATE POLICY "Allow users to update their own avatars"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'avatars' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
        
      CREATE POLICY "Allow users to delete their own avatars"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'avatars' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
  END $$;
COMMIT;

-- Create storage policies for dish-images bucket
BEGIN;
  -- First check if the bucket exists
  DO $$
  DECLARE
    bucket_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'dish-images'
    ) INTO bucket_exists;
    
    IF bucket_exists THEN
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Allow public read access to dish images" ON storage.objects FOR SELECT;
      DROP POLICY IF EXISTS "Allow authenticated users to upload dish images" ON storage.objects FOR INSERT;
      DROP POLICY IF EXISTS "Allow users to update their own dish images" ON storage.objects FOR UPDATE;
      DROP POLICY IF EXISTS "Allow users to delete their own dish images" ON storage.objects FOR DELETE;
      
      -- Create new policies
      CREATE POLICY "Allow public read access to dish images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'dish-images');
        
      CREATE POLICY "Allow authenticated users to upload dish images"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'dish-images' AND
          auth.role() = 'authenticated'
        );
        
      CREATE POLICY "Allow users to update their own dish images"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'dish-images' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
        
      CREATE POLICY "Allow users to delete their own dish images"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'dish-images' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
  END $$;
COMMIT;