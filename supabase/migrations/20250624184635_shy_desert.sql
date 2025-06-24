/*
  # Fix Profile Creation RLS Policies

  1. Security Updates
    - Ensure proper RLS policies for profile creation during registration
    - Add missing policies for profile insertion
    - Fix any policy conflicts that prevent user registration

  2. Changes
    - Drop and recreate INSERT policy for profiles to ensure it works correctly
    - Add proper policy for authenticated users to create their own profiles
    - Ensure the policy allows the auth service to create profiles during registration
*/

-- Drop existing INSERT policy if it exists and recreate it
DROP POLICY IF EXISTS "authenticated_users_insert_own_profile" ON profiles;

-- Create a new INSERT policy that allows users to create their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Also ensure that the service role can bypass RLS for profile creation
-- This is important for the backend service to create profiles during registration
GRANT ALL ON profiles TO service_role;