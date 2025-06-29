/*
  # Update user role to use enum type

  1. Changes
    - Creates a new PostgreSQL enum type called `user_role` with values 'user' and 'admin'
    - Converts the `role` column in `profiles` table from text to the new enum type
    - Sets the default value to 'user'
    - Improves type safety and data integrity
*/

-- Create the enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop the existing check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Convert the column from text to enum
-- First, ensure all values are valid for the enum
UPDATE profiles SET role = 'user' WHERE role IS NULL OR role NOT IN ('user', 'admin');

-- Remove the default constraint first
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Then alter the column type
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role 
  USING role::user_role;

-- Set the default value after the type change
ALTER TABLE profiles 
  ALTER COLUMN role SET DEFAULT 'user'::user_role;