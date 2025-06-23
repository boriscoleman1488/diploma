/*
  # Create storage bucket for dish images

  1. Storage
    - Create `dish-images` bucket for dish and step images
    - Enable public access for dish images
    - Set up RLS policies for image uploads

  2. Security
    - Users can upload images for their own dishes
    - Images are publicly readable
    - File size and type restrictions
*/

-- Create the dish-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dish-images', 
  'dish-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Dish images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload dish images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update dish images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete dish images" ON storage.objects;

-- Allow public access to view dish images
CREATE POLICY "Dish images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

-- Allow authenticated users to upload dish images
-- File name must start with their user ID followed by a dash
CREATE POLICY "Users can upload dish images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dish-images' 
  AND name ~ ('^' || auth.uid()::text || '-.*')
);

-- Allow users to update their own dish images
CREATE POLICY "Users can update dish images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dish-images' 
  AND name ~ ('^' || auth.uid()::text || '-.*')
);

-- Allow users to delete their own dish images
CREATE POLICY "Users can delete dish images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dish-images' 
  AND name ~ ('^' || auth.uid()::text || '-.*')
);