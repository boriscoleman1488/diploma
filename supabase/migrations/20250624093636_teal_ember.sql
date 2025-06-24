/*
  # Remove System Collections

  1. Changes
    - Remove system collection types and related functionality
    - Drop triggers and functions related to system collections
    - Update collection_type to only allow 'custom'
    - Remove system_type column from dish_collections table
  
  2. Reason
    - Simplify the collections system to only use custom collections
    - Remove automatic collection management
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS ensure_user_system_collections_trigger ON profiles;
DROP TRIGGER IF EXISTS update_dish_in_system_collections_trigger ON dishes;
DROP TRIGGER IF EXISTS add_dish_to_system_collections_trigger ON dishes;

-- Drop functions
DROP FUNCTION IF EXISTS ensure_user_system_collections();
DROP FUNCTION IF EXISTS update_dish_in_system_collections();
DROP FUNCTION IF EXISTS add_dish_to_system_collections();

-- Update collection_type to only allow 'custom'
ALTER TABLE dish_collections 
DROP CONSTRAINT IF EXISTS dish_collections_collection_type_check;

ALTER TABLE dish_collections 
ADD CONSTRAINT dish_collections_collection_type_check 
CHECK (collection_type::text = 'custom'::text);

-- Remove system_type column
ALTER TABLE dish_collections 
DROP COLUMN IF EXISTS system_type;

-- Update existing collections to be custom
UPDATE dish_collections 
SET collection_type = 'custom' 
WHERE collection_type != 'custom';

-- Add comment explaining the changes
COMMENT ON TABLE dish_collections IS 'User-created collections of dishes (only custom collections are supported)';