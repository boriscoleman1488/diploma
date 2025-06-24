/*
  # Fix collections auto-creation issue

  1. Changes
    - Modify the ensure_user_system_collections function to check if system collections exist before creating them
    - Add a constraint to prevent duplicate system collections for the same user
    - Update the collection_type field to handle system collections properly
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add a unique constraint to prevent duplicate system collections for the same user and type
ALTER TABLE dish_collections 
ADD CONSTRAINT unique_user_system_collection 
UNIQUE (user_id, system_type);

-- Update the ensure_user_system_collections function to be more robust
CREATE OR REPLACE FUNCTION ensure_user_system_collections()
RETURNS TRIGGER AS $$
DECLARE
  system_types TEXT[] := ARRAY['my_dishes', 'liked', 'published', 'private'];
  system_type TEXT;
  collection_exists BOOLEAN;
BEGIN
  -- Check if the user already has system collections
  SELECT EXISTS (
    SELECT 1 FROM dish_collections 
    WHERE user_id = NEW.id AND system_type IS NOT NULL
    LIMIT 1
  ) INTO collection_exists;
  
  -- If user already has system collections, don't create them again
  IF collection_exists THEN
    RETURN NEW;
  END IF;
  
  -- Create system collections only if they don't exist
  FOREACH system_type IN ARRAY system_types
  LOOP
    INSERT INTO dish_collections (
      user_id, 
      name, 
      description, 
      collection_type, 
      system_type, 
      is_public
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
      system_type,
      system_type = 'published'
    )
    ON CONFLICT (user_id, system_type) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the CollectionService to handle system collections properly
CREATE OR REPLACE FUNCTION update_dish_in_system_collections()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed
  IF OLD.status <> NEW.status THEN
    -- Remove from all system collections first
    DELETE FROM dish_collection_items
    WHERE dish_id = NEW.id
    AND user_id = NEW.user_id
    AND collection_id IN (
      SELECT id FROM dish_collections
      WHERE user_id = NEW.user_id
      AND system_type IS NOT NULL
    );
    
    -- Add to appropriate system collections based on new status
    
    -- Always add to my_dishes
    INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
    SELECT id, NEW.id, NEW.user_id
    FROM dish_collections
    WHERE user_id = NEW.user_id
    AND system_type = 'my_dishes'
    ON CONFLICT (collection_id, dish_id, user_id) DO NOTHING;
    
    -- Add to published if approved
    IF NEW.status = 'approved' THEN
      INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
      SELECT id, NEW.id, NEW.user_id
      FROM dish_collections
      WHERE user_id = NEW.user_id
      AND system_type = 'published'
      ON CONFLICT (collection_id, dish_id, user_id) DO NOTHING;
    END IF;
    
    -- Add to private if draft, pending or rejected
    IF NEW.status IN ('draft', 'pending', 'rejected') THEN
      INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
      SELECT id, NEW.id, NEW.user_id
      FROM dish_collections
      WHERE user_id = NEW.user_id
      AND system_type = 'private'
      ON CONFLICT (collection_id, dish_id, user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;