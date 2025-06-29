/*
  # Enable public access to approved dishes

  1. Security Changes
    - Enable RLS on `dishes` table
    - Add policy for public access to approved dishes
    - Add policy for public access to profile information needed for dishes
    - Enable RLS on `profiles` table if not already enabled
    - Add policies for public access to dish-related tables

  2. Tables Affected
    - `dishes` - Enable RLS and add public read policy for approved dishes
    - `profiles` - Ensure public can read basic profile info for dish authors
    - `dish_categories` - Allow public read access
    - `dish_category_relations` - Allow public read access
    - `dish_ingredients` - Allow public read access
    - `dish_steps` - Allow public read access
    - `dish_ratings` - Already has public read policy
    - `dish_comments` - Already has public read policy

  This migration ensures that unauthenticated users can view approved dishes and all related information needed for the public dish listing and detail pages.
*/

-- Enable RLS on dishes table
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Policy for public access to approved dishes
CREATE POLICY "Public can view approved dishes"
  ON dishes
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy for authenticated users to view their own dishes (all statuses)
CREATE POLICY "Users can view their own dishes"
  ON dishes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update existing profiles policies to ensure public access to basic info
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public can view basic profile info"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable RLS on dish_categories and allow public read access
ALTER TABLE dish_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dish categories"
  ON dish_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable RLS on dish_category_relations and allow public read access
ALTER TABLE dish_category_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dish category relations"
  ON dish_category_relations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable RLS on dish_ingredients and allow public read access
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dish ingredients"
  ON dish_ingredients
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable RLS on dish_steps and allow public read access
ALTER TABLE dish_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dish steps"
  ON dish_steps
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ensure dish_ratings RLS is enabled (it should already be based on schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'dish_ratings' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE dish_ratings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Ensure dish_comments RLS is enabled (it should already be based on schema)  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'dish_comments' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE dish_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;