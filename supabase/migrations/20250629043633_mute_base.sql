/*
  # AI Chat Persistence Tables

  1. New Tables
    - `ai_chat_sessions` - Stores user chat sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text, default 'New Chat')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_archived` (boolean, default false)
    - `ai_chat_messages` - Stores individual messages within sessions
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to ai_chat_sessions)
      - `role` (text, either 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamp)
      - `metadata` (jsonb, default '{}')

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own chat data
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

-- Create indexes for better performance
CREATE INDEX idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_updated_at ON ai_chat_sessions(updated_at DESC);
CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);

-- Create RLS policies for ai_chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON ai_chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON ai_chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON ai_chat_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON ai_chat_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for ai_chat_messages
CREATE POLICY "Users can view messages in their own chat sessions"
  ON ai_chat_messages
  FOR SELECT
  TO authenticated
  USING (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages in their own chat sessions"
  ON ai_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages in their own chat sessions"
  ON ai_chat_messages
  FOR UPDATE
  TO authenticated
  USING (session_id IN (
    SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
  ));

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

CREATE TRIGGER update_ai_chat_sessions_updated_at
BEFORE UPDATE ON ai_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_ai_chat_sessions_updated_at();