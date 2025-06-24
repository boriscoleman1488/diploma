/*
  # Remove collection publicity

  1. Changes
     - Remove is_public column from dish_collections table
     - Update RLS policies to remove public collection access
     - Update system collections to not be public

  2. Security
     - Adjust RLS policies to only allow access to user's own collections
*/

-- First, update RLS policies to remove public collection access
DROP POLICY IF EXISTS "Users can view public collections" ON dish_collections;

-- Update policy for viewing collections to only allow own collections
DROP POLICY IF EXISTS "Users can view their own collections" ON dish_collections;
CREATE POLICY "Users can view their own collections"
  ON dish_collections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update policy for viewing collection items
DROP POLICY IF EXISTS "Users can view items in their collections" ON dish_collection_items;
CREATE POLICY "Users can view items in their collections"
  ON dish_collection_items
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM dish_collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Update ensure_user_system_collections function to remove is_public
CREATE OR REPLACE FUNCTION ensure_user_system_collections()
RETURNS TRIGGER AS $$
DECLARE
  system_types TEXT[] := ARRAY['my_dishes', 'liked', 'published', 'private'];
  system_type TEXT;
  collection_exists BOOLEAN;
BEGIN
  FOREACH system_type IN ARRAY system_types
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM dish_collections 
      WHERE user_id = NEW.id AND system_type = system_type
    ) INTO collection_exists;
    
    IF NOT collection_exists THEN
      INSERT INTO dish_collections (
        user_id, 
        name, 
        description, 
        collection_type, 
        system_type
      )
      VALUES (
        NEW.id,
        CASE 
          WHEN system_type = 'my_dishes' THEN 'Мої страви'
          WHEN system_type = 'liked' THEN 'Улюблені'
          WHEN system_type = 'published' THEN 'Опубліковані'
          WHEN system_type = 'private' THEN 'Приватні'
          ELSE 'Колекція'
        END,
        CASE 
          WHEN system_type = 'my_dishes' THEN 'Ваші створені страви'
          WHEN system_type = 'liked' THEN 'Збережені страви інших користувачів'
          WHEN system_type = 'published' THEN 'Ваші опубліковані страви'
          WHEN system_type = 'private' THEN 'Ваші приватні страви'
          ELSE 'Колекція страв'
        END,
        'system',
        system_type
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove is_public column from dish_collections table
ALTER TABLE dish_collections DROP COLUMN IF EXISTS is_public;