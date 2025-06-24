/*
  # Add DELETE policy for dish comments

  1. Security Changes
    - Add RLS policy to allow comment authors to delete their own comments
    - Add RLS policy to allow dish owners to delete comments on their dishes
    - This enables proper cleanup when dishes are deleted

  The policy allows deletion if:
  - The user is the comment author (auth.uid() = user_id), OR
  - The user is the owner of the dish that the comment belongs to
*/

-- Add DELETE policy for dish comments
CREATE POLICY "Users can delete own comments or dish owners can delete comments on their dishes"
  ON dish_comments
  FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = user_id) OR 
    (auth.uid() IN (
      SELECT dishes.user_id 
      FROM dishes 
      WHERE dishes.id = dish_comments.dish_id
    ))
  );

-- Also add SELECT policy so users can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON dish_comments
  FOR SELECT
  TO public
  USING (true);

-- Add UPDATE policy for comment authors
CREATE POLICY "Users can update their own comments"
  ON dish_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);