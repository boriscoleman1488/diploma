export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: Record<string, any>
}

export interface CreateSessionRequest {
  title?: string
}

export interface UpdateSessionRequest {
  title?: string
}

export interface CreateMessageRequest {
  content: string
  role?: 'user' | 'assistant'
  metadata?: Record<string, any>
}

export interface GenerateResponseRequest {
  sessionId: string
  userMessage: string
  previousMessages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface ChatSessionResponse {
  success: boolean
  session?: ChatSession
  error?: string
  message?: string
}

export interface ChatSessionsResponse {
  success: boolean
  sessions: ChatSession[]
  error?: string
  message?: string
}

export interface ChatMessageResponse {
  success: boolean
  message?: ChatMessage
  error?: string
}

export interface ChatMessagesResponse {
  success: boolean
  session?: ChatSession
  messages: ChatMessage[]
  error?: string
  message?: string
}

export interface GenerateResponseResponse {
  success: boolean
  userMessage?: ChatMessage
  aiMessage?: ChatMessage
  errorMessage?: string
  error?: string
  message?: string
}