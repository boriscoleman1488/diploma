/*
  # Fix nullable foreign keys in dish_collection_items table

  1. Data Cleanup
    - Remove any records with NULL foreign key values
  
  2. Schema Changes
    - Make collection_id NOT NULL
    - Make dish_id NOT NULL  
    - Make user_id NOT NULL
  
  3. Security
    - Maintain existing RLS policies
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