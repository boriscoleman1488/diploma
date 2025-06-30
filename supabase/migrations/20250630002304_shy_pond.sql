/*
  # Fix Collection Deletion

  1. Problem
    - Users cannot delete collections with dishes because the foreign key constraint
      on dish_collection_items doesn't have ON DELETE CASCADE
    - This prevents proper deletion of collections that have items

  2. Changes
    - Add ON DELETE CASCADE to the foreign key constraint from dish_collection_items to dish_collections
    - This ensures that when a collection is deleted, all its items are automatically deleted too

  3. Security
    - No changes to RLS policies needed
    - Existing policies already handle access control properly
*/

-- First, drop the existing foreign key constraint
ALTER TABLE dish_collection_items
DROP CONSTRAINT IF EXISTS dish_collection_items_collection_id_fkey;

-- Recreate the constraint with ON DELETE CASCADE
ALTER TABLE dish_collection_items
ADD CONSTRAINT dish_collection_items_collection_id_fkey
FOREIGN KEY (collection_id) REFERENCES dish_collections(id) ON DELETE CASCADE;