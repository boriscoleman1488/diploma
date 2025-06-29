/*
  # Remove order_index from dish_ingredients table

  1. Changes
    - Remove the order_index column from dish_ingredients table
    - This simplifies the ingredients structure as steps already have a natural order
*/

-- Remove the order_index column from dish_ingredients table
ALTER TABLE IF EXISTS public.dish_ingredients DROP COLUMN IF EXISTS order_index;