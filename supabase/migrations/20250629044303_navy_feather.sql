/*
  # AI Chat System Tables

  1. New Tables
    - `ai_chat_sessions` - Stores user chat sessions with the AI assistant
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text, default 'New Chat')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_archived` (boolean)
    - `ai_chat_messages` - Stores individual messages within AI chat sessions
      - `id` (uuid, primary key)
      - `session_id` (uuid, references ai_chat_sessions)
      - `role` (text, either 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamp)
      - `metadata` (jsonb)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own chat sessions and messages
*/

-- Create AI Chat Sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false
);

-- Create AI Chat Messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_chat_sessions_user_id') THEN
    CREATE INDEX idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_chat_sessions_updated_at') THEN
    CREATE INDEX idx_ai_chat_sessions_updated_at ON ai_chat_sessions(updated_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_chat_messages_session_id') THEN
    CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_chat_messages_created_at') THEN
    CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);
  END IF;
END $$;

-- Create RLS policies for ai_chat_sessions
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON ai_chat_sessions;
CREATE POLICY "Users can view their own chat sessions"
  ON ai_chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own chat sessions" ON ai_chat_sessions;
CREATE POLICY "Users can create their own chat sessions"
  ON ai_chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON ai_chat_sessions;
CREATE POLICY "Users can update their own chat sessions"
  ON ai_chat_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON ai_chat_sessions;
CREATE POLICY "Users can delete their own chat sessions"
  ON ai_chat_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for ai_chat_messages
DROP POLICY IF EXISTS "Users can view messages in their own chat sessions" ON ai_chat_messages;
CREATE POLICY "Users can view messages in their own chat sessions"
  ON ai_chat_messages
  FOR SELECT
  TO authenticated
  USING (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert messages in their own chat sessions" ON ai_chat_messages;
CREATE POLICY "Users can insert messages in their own chat sessions"
  ON ai_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update messages in their own chat sessions" ON ai_chat_messages;
CREATE POLICY "Users can update messages in their own chat sessions"
  ON ai_chat_messages
  FOR UPDATE
  TO authenticated
  USING (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete messages in their own chat sessions" ON ai_chat_messages;
CREATE POLICY "Users can delete messages in their own chat sessions"
  ON ai_chat_messages
  FOR DELETE
  TO authenticated
  USING (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

-- Create trigger to update updated_at on ai_chat_sessions
CREATE OR REPLACE FUNCTION update_ai_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_chat_sessions_updated_at ON ai_chat_sessions;
CREATE TRIGGER update_ai_chat_sessions_updated_at
BEFORE UPDATE ON ai_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_ai_chat_sessions_updated_at();