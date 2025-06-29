/*
  # Update AI chat messages schema

  1. Changes
     - Remove metadata column from ai_chat_messages table
*/

-- Remove metadata column from ai_chat_messages table
ALTER TABLE public.ai_chat_messages DROP COLUMN IF EXISTS metadata;