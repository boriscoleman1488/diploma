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

-- Add a comment explaining the migration
COMMENT ON TABLE dish_collection_items IS 'Collection items linking dishes to collections with required foreign keys';