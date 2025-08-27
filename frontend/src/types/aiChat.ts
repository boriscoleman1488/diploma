export interface AiChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  messages_count?: number
  profiles?: {
    id: string
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
}

export interface AiChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: Record<string, any>
  ai_chat_sessions?: {
    id: string
    title: string
    user_id: string
    profiles?: {
      id: string
      full_name?: string
      email: string
      profile_tag?: string
    }
  }
}

export interface AiChatStats {
  totalSessions: number
  totalMessages: number
  activeUsers: number
  recentSessions: number
  generatedAt: string
}

export interface ActiveUser {
  user: {
    id: string
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
  sessionsCount: number
  messagesCount: number
}

export interface AiChatStatsResponse {
  success: boolean
  stats: AiChatStats
  error?: string
  message?: string
}

export interface AiChatSessionsResponse {
  success: boolean
  sessions: AiChatSession[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
  message?: string
}

export interface AiChatSessionDetailsResponse {
  success: boolean
  session?: AiChatSession
  messages: AiChatMessage[]
  error?: string
  message?: string
}

export interface AiChatMessagesSearchResponse {
  success: boolean
  messages: AiChatMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  searchQuery: string
  error?: string
  message?: string
}

export interface ActiveUsersResponse {
  success: boolean
  activeUsers: ActiveUser[]
  error?: string
  message?: string
}