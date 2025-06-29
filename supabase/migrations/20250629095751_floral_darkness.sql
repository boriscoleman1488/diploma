/*
  # Enable public access to approved dishes

  1. Security Changes
    - Enable RLS on `dishes` table
    - Enable RLS on `profiles` table (if not already enabled)
    - Enable RLS on `dish_steps` table
    - Enable RLS on `dish_ingredients` table
    - Enable RLS on `dish_categories` table
    - Enable RLS on `dish_category_relations` table

  2. New Policies
    - Allow anonymous users to view approved dishes
    - Allow anonymous users to view public profile information
    - Allow anonymous users to view dish steps for approved dishes
    - Allow anonymous users to view dish ingredients for approved dishes
    - Allow anonymous users to view dish categories
    - Allow anonymous users to view dish category relations for approved dishes

  This enables public users to browse approved dishes and their details without authentication.
*/

-- Enable RLS on dishes table
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dish_steps table
ALTER TABLE dish_steps ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dish_ingredients table
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dish_categories table
ALTER TABLE dish_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dish_category_relations table
ALTER TABLE dish_category_relations ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous users to view approved dishes
CREATE POLICY "Anonymous users can view approved dishes"
  ON dishes
  FOR SELECT
  TO anon
  USING (status = 'approved');

-- Policy for authenticated users to view approved dishes (in addition to existing policies)
CREATE POLICY "Authenticated users can view approved dishes"
  ON dishes
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Policy for anonymous users to view public profile information
CREATE POLICY "Anonymous users can view public profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Policy for anonymous users to view dish steps for approved dishes
CREATE POLICY "Anonymous users can view steps for approved dishes"
  ON dish_steps
  FOR SELECT
  TO anon
  USING (
    dish_id IN (
      SELECT id FROM dishes WHERE status = 'approved'
    )
  );

-- Policy for authenticated users to view dish steps for approved dishes
CREATE POLICY "Authenticated users can view steps for approved dishes"
  ON dish_steps
  FOR SELECT
  TO authenticated
  USING (
    dish_id IN (
      SELECT id FROM dishes WHERE status = 'approved'
    )
  );

-- Policy for anonymous users to view dish ingredients for approved dishes
CREATE POLICY "Anonymous users can view ingredients for approved dishes"
  ON dish_ingredients
  FOR SELECT
  TO anon
  USING (
    dish_id IN (
      SELECT id FROM dishes WHERE status = 'approved'
    )
  );

-- Policy for authenticated users to view dish ingredients for approved dishes
CREATE POLICY "Authenticated users can view ingredients for approved dishes"
  ON dish_ingredients
  FOR SELECT
  TO authenticated
  USING (
    dish_id IN (
      SELECT id FROM dishes WHERE status = 'approved'
    )
  );

-- Policy for anonymous users to view all dish categories
CREATE POLICY "Anonymous users can view dish categories"
  ON dish_categories
  FOR SELECT
  TO anon
  USING (true);

-- Policy for authenticated users to view all dish categories
CREATE POLICY "Authenticated users can view dish categories"
  ON dish_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for anonymous users to view category relations for approved dishes
CREATE POLICY "Anonymous users can view category relations for approved dishes"
  ON dish_category_relations
  FOR SELECT
  TO anon
  USING (
    dish_id IN (
      SELECT id FROM dishes WHERE status = 'approved'
    )
  );

-- Policy for authenticated users to view category relations for approved dishes
CREATE POLICY "Authenticated users can view category relations for approved dishes"
  ON dish_category_relations
  FOR SELECT
  TO authenticated
  USING (
    dish_id IN (
      SELECT id FROM dishes WHERE status = 'approved'
    )
  );