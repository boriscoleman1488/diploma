/*
  # Create dish-images storage bucket with RLS policies

  1. Storage Setup
    - Create `dish-images` bucket if it doesn't exist
    - Configure bucket as public for read access
    - Set file size limits and allowed file types

  2. Security Policies
    - Allow authenticated users to upload images (INSERT)
    - Allow public read access to images (SELECT)
    - Allow users to update their own uploaded images (UPDATE)
    - Allow users to delete their own uploaded images (DELETE)

  3. Configuration
    - Set maximum file size to 10MB
    - Allow image file types: jpeg, jpg, png, webp
*/

-- Create the dish-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dish-images',
  'dish-images',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Enable RLS on the storage.objects table (should already be enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images to dish-images bucket
CREATE POLICY "Allow authenticated users to upload dish images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dish-images' 
  AND auth.uid() IS NOT NULL
);

-- Policy: Allow public read access to dish images
CREATE POLICY "Allow public read access to dish images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'dish-images');

-- Policy: Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own dish images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dish-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'dish-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own dish images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'dish-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);