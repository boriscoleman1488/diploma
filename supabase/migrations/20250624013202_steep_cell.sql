/*
  # Fix nullable foreign keys in dish_collection_items table

  1. Changes
    - Remove any records with NULL foreign key values
    - Alter collection_id, dish_id, and user_id columns to be NOT NULL
    - Add a comment to the table explaining its purpose
  
  2. Reason
    - Nullable foreign keys were causing internal server errors when fetching collections
    - This ensures data integrity and prevents errors in the application
*/

-- First, clean up any existing records with NULL foreign key values
DELETE FROM dish_collection_items 
WHERE collection_id IS NULL 
   OR dish_id IS NULL 
   OR user_id IS NULL;

-- Now make the foreign key columns NOT NULL
ALTER TABLE dish_collection_items 
ALTER COLUMN collection_id SET NOT NULL;

ALTER TABLE dish_collection_items 
ALTER COLUMN dish_id SET NOT NULL;

ALTER TABLE dish_collection_items 
ALTER COLUMN user_id SET NOT NULL;

-- Add a comment explaining the table's purpose
COMMENT ON TABLE dish_collection_items IS 'Collection items linking dishes to collections with required foreign keys';