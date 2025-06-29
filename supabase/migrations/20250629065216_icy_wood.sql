/*
  # Remove AI Saved Recipes Table

  1. Changes
     - Drop the ai_saved_recipes table
     - Remove all references to this table

  2. Security
     - No security changes needed
*/

-- Drop the ai_saved_recipes table
DROP TABLE IF EXISTS public.ai_saved_recipes;