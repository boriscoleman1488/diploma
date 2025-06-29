/*
  # Update role column to use enum type

  1. Changes
    - Create a new PostgreSQL enum type called `user_role` with values 'user' and 'admin'
    - Drop the existing check constraint on the `role` column
    - Convert the `role` column from text to the new enum type
    - Set the default value to 'user'
  
  2. Security
    - Maintains the same role values, just changes the implementation
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

-- Then alter the column type
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role 
  USING role::user_role;

-- Set the default value
ALTER TABLE profiles 
  ALTER COLUMN role SET DEFAULT 'user'::user_role;