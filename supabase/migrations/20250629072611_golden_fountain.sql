/*
  # Remove metadata field from ai_chat_messages table

  1. Changes
    - Remove the metadata field from ai_chat_messages table
*/

-- Remove the metadata column from ai_chat_messages table
ALTER TABLE public.ai_chat_messages DROP COLUMN IF EXISTS metadata;