/*
  # Convert role column to enum type

  1. Changes
    - Create user_role enum type with values 'user' and 'admin'
    - Convert profiles.role from text to user_role enum
    - Handle policies that depend on the role column
  
  2. Security
    - Temporarily drops and recreates policies that depend on the role column
*/

-- First, save the existing policies that depend on the role column
CREATE TEMPORARY TABLE temp_policies AS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual, 
  with_check, 
  roles
FROM pg_policies 
WHERE tablename = 'profiles' 
AND qual LIKE '%role%';

-- Drop the policies that depend on the role column
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname, tablename 
    FROM temp_policies
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 
                  policy_record.policyname, 
                  policy_record.tablename);
  END LOOP;
END $$;

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

-- Recreate the policies
DO $$
DECLARE
  policy_record RECORD;
  new_qual TEXT;
  new_with_check TEXT;
BEGIN
  FOR policy_record IN 
    SELECT * FROM temp_policies
  LOOP
    -- Replace text literals with enum literals in policy expressions
    new_qual := REPLACE(policy_record.qual, '''admin''::text', '''admin''::user_role');
    new_qual := REPLACE(new_qual, '''user''::text', '''user''::user_role');
    
    IF policy_record.with_check IS NOT NULL THEN
      new_with_check := REPLACE(policy_record.with_check, '''admin''::text', '''admin''::user_role');
      new_with_check := REPLACE(new_with_check, '''user''::text', '''user''::user_role');
    ELSE
      new_with_check := NULL;
    END IF;
    
    -- Recreate the policy
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR %s TO %s USING (%s) %s',
      policy_record.policyname,
      policy_record.tablename,
      policy_record.cmd,
      array_to_string(policy_record.roles, ', '),
      new_qual,
      CASE WHEN new_with_check IS NOT NULL THEN 'WITH CHECK (' || new_with_check || ')' ELSE '' END
    );
  END LOOP;
END $$;

-- Clean up
DROP TABLE temp_policies;