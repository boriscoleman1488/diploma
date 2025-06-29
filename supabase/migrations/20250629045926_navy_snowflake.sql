/*
  # Fix AI chat session deletion

  1. Problem
    - Users cannot delete AI chat sessions because of foreign key constraint
    - The ai_chat_messages table references ai_chat_sessions without CASCADE delete
    - This prevents deletion of sessions that have associated messages

  2. Solution
    - Drop the existing foreign key constraint
    - Recreate it with ON DELETE CASCADE
    - This will automatically delete all messages when a session is deleted

  3. Security
    - No changes to RLS policies needed
    - Existing policies already handle access control properly
*/

-- Drop the existing foreign key constraint
ALTER TABLE public.ai_chat_messages
DROP CONSTRAINT ai_chat_messages_session_id_fkey;

-- Recreate the constraint with ON DELETE CASCADE
ALTER TABLE public.ai_chat_messages
ADD CONSTRAINT ai_chat_messages_session_id_fkey
FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE;