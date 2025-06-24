-- Enable RLS on dish_collections
ALTER TABLE dish_collections ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dish_collection_items
ALTER TABLE dish_collection_items ENABLE ROW LEVEL SECURITY;

-- Policies for dish_collections

-- Users can view their own collections
CREATE POLICY "Users can view their own collections"
  ON dish_collections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view public collections
CREATE POLICY "Users can view public collections"
  ON dish_collections
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Users can create their own collections
CREATE POLICY "Users can create their own collections"
  ON dish_collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update their own collections"
  ON dish_collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete their own collections"
  ON dish_collections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for dish_collection_items

-- Users can view items in their collections
CREATE POLICY "Users can view items in their collections"
  ON dish_collection_items
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM dish_collections 
      WHERE id = collection_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

-- Users can add items to their collections
CREATE POLICY "Users can add items to their collections"
  ON dish_collection_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM dish_collections 
      WHERE id = collection_id
    )
  );

-- Users can delete items from their collections
CREATE POLICY "Users can delete items from their collections"
  ON dish_collection_items
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM dish_collections 
      WHERE id = collection_id
    )
  );

-- Create function to ensure system collections exist for each user
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
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure system collections exist for each user
CREATE TRIGGER ensure_user_system_collections_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION ensure_user_system_collections();

-- Create function to update dish in system collections when status changes
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
      AND collection_type = 'system'
    );
    
    -- Add to appropriate system collections based on new status
    
    -- Always add to my_dishes
    INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
    SELECT id, NEW.id, NEW.user_id
    FROM dish_collections
    WHERE user_id = NEW.user_id
    AND system_type = 'my_dishes'
    ON CONFLICT DO NOTHING;
    
    -- Add to published if approved
    IF NEW.status = 'approved' THEN
      INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
      SELECT id, NEW.id, NEW.user_id
      FROM dish_collections
      WHERE user_id = NEW.user_id
      AND system_type = 'published'
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Add to private if draft, pending or rejected
    IF NEW.status IN ('draft', 'pending', 'rejected') THEN
      INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
      SELECT id, NEW.id, NEW.user_id
      FROM dish_collections
      WHERE user_id = NEW.user_id
      AND system_type = 'private'
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update dish in system collections when status changes
CREATE TRIGGER update_dish_in_system_collections_trigger
AFTER UPDATE ON dishes
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_dish_in_system_collections();

-- Create function to add new dish to system collections
CREATE OR REPLACE FUNCTION add_dish_to_system_collections()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to my_dishes
  INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
  SELECT id, NEW.id, NEW.user_id
  FROM dish_collections
  WHERE user_id = NEW.user_id
  AND system_type = 'my_dishes'
  ON CONFLICT DO NOTHING;
  
  -- Add to published if approved
  IF NEW.status = 'approved' THEN
    INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
    SELECT id, NEW.id, NEW.user_id
    FROM dish_collections
    WHERE user_id = NEW.user_id
    AND system_type = 'published'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Add to private if draft, pending or rejected
  IF NEW.status IN ('draft', 'pending', 'rejected') THEN
    INSERT INTO dish_collection_items (collection_id, dish_id, user_id)
    SELECT id, NEW.id, NEW.user_id
    FROM dish_collections
    WHERE user_id = NEW.user_id
    AND system_type = 'private'
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add new dish to system collections
CREATE TRIGGER add_dish_to_system_collections_trigger
AFTER INSERT ON dishes
FOR EACH ROW
EXECUTE FUNCTION add_dish_to_system_collections();