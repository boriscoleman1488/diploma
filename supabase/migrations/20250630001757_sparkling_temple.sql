/*
  # Storage Bucket Policies

  1. New Policies
    - Create policies for avatars bucket
    - Create policies for dish-images bucket
    - Allow public read access to both buckets
    - Allow authenticated users to upload to both buckets
    - Allow users to update/delete only their own files

  2. Security
    - Ensure users can only manage their own files
    - Allow public read access for all images
*/

-- Create storage policies for avatars bucket
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Allow public read access to avatars"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatars');
      
    CREATE POLICY "Allow authenticated users to upload avatars"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars' AND
        auth.role() = 'authenticated'
      );
      
    CREATE POLICY "Allow users to update their own avatars"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
      
    CREATE POLICY "Allow users to delete their own avatars"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Create storage policies for dish-images bucket
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'dish-images'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access to dish images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload dish images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to update their own dish images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete their own dish images" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Allow public read access to dish images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'dish-images');
      
    CREATE POLICY "Allow authenticated users to upload dish images"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'dish-images' AND
        auth.role() = 'authenticated'
      );
      
    CREATE POLICY "Allow users to update their own dish images"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'dish-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
      
    CREATE POLICY "Allow users to delete their own dish images"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'dish-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;