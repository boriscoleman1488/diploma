import { authenticateUser, requireAdmin } from '../../middleware/auth.js'

export default async function aiAdminRoutes(fastify, options) {
  // Get AI chat statistics
  fastify.get('/stats', {
    preHandler: [authenticateUser, requireAdmin]
  }, async (request, reply) => {
    try {
      // Get total sessions count
      const { count: totalSessions, error: sessionsError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('*', { count: 'exact', head: true })
      
      if (sessionsError) {
        fastify.log.error('Error fetching sessions count', { error: sessionsError.message })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch sessions statistics',
          message: 'Не вдалося отримати статистику сесій'
        })
      }
      
      // Get total messages count
      const { count: totalMessages, error: messagesError } = await fastify.supabase
        .from('ai_chat_messages')
        .select('*', { count: 'exact', head: true })
      
      if (messagesError) {
        fastify.log.error('Error fetching messages count', { error: messagesError.message })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch messages statistics',
          message: 'Не вдалося отримати статистику повідомлень'
        })
      }
      
      // Get active users count (users who have at least one chat session)
      const { data: activeUsers, error: usersError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('user_id')
      
      if (usersError) {
        fastify.log.error('Error fetching active users', { error: usersError.message })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch active users statistics',
          message: 'Не вдалося отримати статистику активних користувачів'
        })
      }
      
      const uniqueActiveUsers = new Set(activeUsers?.map(session => session.user_id) || []).size
      
      // Get recent activity (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { count: recentSessions, error: recentError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())
      
      if (recentError) {
        fastify.log.error('Error fetching recent sessions', { error: recentError.message })
      }
      
      return {
        success: true,
        stats: {
          totalSessions: totalSessions || 0,
          totalMessages: totalMessages || 0,
          activeUsers: uniqueActiveUsers,
          recentSessions: recentSessions || 0,
          generatedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      fastify.log.error('AI chat stats error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання статистики AI-чату'
      })
    }
  })
  
  // Get all chat sessions with pagination and search
  fastify.get('/sessions', {
    preHandler: [authenticateUser, requireAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          search: { type: 'string' },
          userId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, search, userId } = request.query
      const offset = (page - 1) * limit
      
      let query = fastify.supabase
        .from('ai_chat_sessions')
        .select(`
          *,
          profiles:user_id(
            id,
            full_name,
            email,
            profile_tag,
            avatar_url
          ),
          ai_chat_messages(id)
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      // Filter by user if specified
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      // Search functionality
      if (search?.trim()) {
        const searchTerm = search.trim()
        query = query.or(`title.ilike.%${searchTerm}%`)
      }
      
      const { data: sessions, error, count } = await query
      
      if (error) {
        fastify.log.error('Error fetching chat sessions for admin', { error: error.message })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch chat sessions',
          message: 'Не вдалося отримати сесії чату'
        })
      }
      
      // Process sessions to include message count
      const processedSessions = sessions?.map(session => ({
        ...session,
        messages_count: session.ai_chat_messages?.length || 0
      })) || []
      
      // Clean up nested properties
      processedSessions.forEach(session => {
        delete session.ai_chat_messages
      })
      
      return {
        success: true,
        sessions: processedSessions,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      fastify.log.error('AI chat sessions fetch error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання сесій чату'
      })
    }
  })
  
  // Get specific chat session details with messages
  fastify.get('/sessions/:sessionId', {
    preHandler: [authenticateUser, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params
      
      // Get session details
      const { data: session, error: sessionError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select(`
          *,
          profiles:user_id(
            id,
            full_name,
            email,
            profile_tag,
            avatar_url,
            created_at
          )
        `)
        .eq('id', sessionId)
        .single()
      
      if (sessionError || !session) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено'
        })
      }
      
      // Get all messages in the session
      const { data: messages, error: messagesError } = await fastify.supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (messagesError) {
        fastify.log.error('Error fetching chat messages for admin', { error: messagesError.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch chat messages',
          message: 'Не вдалося отримати повідомлення чату'
        })
      }
      
      return {
        success: true,
        session,
        messages: messages || []
      }
    } catch (error) {
      fastify.log.error('AI chat session details fetch error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання деталей сесії чату'
      })
    }
  })
  
  // Delete a chat session (admin only)
  fastify.delete('/sessions/:sessionId', {
    preHandler: [authenticateUser, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params
      
      // Check if session exists
      const { data: existingSession, error: checkError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('id, title, user_id')
        .eq('id', sessionId)
        .single()
      
      if (checkError || !existingSession) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено'
        })
      }
      
      // Delete the session (messages will be deleted via cascade)
      const { error } = await fastify.supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId)
      
      if (error) {
        fastify.log.error('Error deleting chat session by admin', { error: error.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete chat session',
          message: 'Не вдалося видалити сесію чату'
        })
      }
      
      fastify.log.info('Chat session deleted by admin', { 
        sessionId, 
        sessionTitle: existingSession.title,
        userId: existingSession.user_id 
      })
      
      return {
        success: true,
        message: 'Chat session deleted successfully'
      }
    } catch (error) {
      fastify.log.error('AI chat session deletion error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка видалення сесії чату'
      })
    }
  })
  
  // Search messages across all chats
  fastify.get('/messages/search', {
    preHandler: [authenticateUser, requireAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 1 },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          role: { type: 'string', enum: ['user', 'assistant'] },
          userId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { query: searchQuery, page = 1, limit = 20, role, userId } = request.query
      
      if (!searchQuery?.trim()) {
        return reply.code(400).send({
          success: false,
          error: 'Search query is required',
          message: 'Пошуковий запит є обов\'язковим'
        })
      }
      
      const offset = (page - 1) * limit
      
      let query = fastify.supabase
        .from('ai_chat_messages')
        .select(`
          *,
          ai_chat_sessions:session_id(
            id,
            title,
            user_id,
            profiles:user_id(
              id,
              full_name,
              email,
              profile_tag
            )
          )
        `, { count: 'exact' })
        .ilike('content', `%${searchQuery.trim()}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      // Filter by role if specified
      if (role) {
        query = query.eq('role', role)
      }
      
      // Filter by user if specified
      if (userId) {
        query = query.eq('ai_chat_sessions.user_id', userId)
      }
      
      const { data: messages, error, count } = await query
      
      if (error) {
        fastify.log.error('Error searching chat messages', { error: error.message })
        return reply.code(500).send({
          success: false,
          error: 'Failed to search messages',
          message: 'Не вдалося знайти повідомлення'
        })
      }
      
      return {
        success: true,
        messages: messages || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        },
        searchQuery
      }
    } catch (error) {
      fastify.log.error('AI chat messages search error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка пошуку повідомлень'
      })
    }
  })
  
  // Get most active users in AI chat
  fastify.get('/users/active', {
    preHandler: [authenticateUser, requireAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { limit = 10 } = request.query
      
      // Get users with their session and message counts
      const { data: sessions, error } = await fastify.supabase
        .from('ai_chat_sessions')
        .select(`
          user_id,
          profiles:user_id(
            id,
            full_name,
            email,
            profile_tag,
            avatar_url
          ),
          ai_chat_messages(id)
        `)
      
      if (error) {
        fastify.log.error('Error fetching active AI chat users', { error: error.message })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch active users',
          message: 'Не вдалося отримати активних користувачів'
        })
      }
      
      // Group by user and count sessions and messages
      const userStats = {}
      sessions?.forEach(session => {
        const userId = session.user_id
        if (!userStats[userId]) {
          userStats[userId] = {
            user: session.profiles,
            sessionsCount: 0,
            messagesCount: 0
          }
        }
        userStats[userId].sessionsCount++
        userStats[userId].messagesCount += session.ai_chat_messages?.length || 0
      })
      
      // Convert to array and sort by activity
      const activeUsers = Object.values(userStats)
        .sort((a, b) => (b.messagesCount + b.sessionsCount) - (a.messagesCount + a.sessionsCount))
        .slice(0, limit)
      
      return {
        success: true,
        activeUsers
      }
    } catch (error) {
      fastify.log.error('AI chat active users fetch error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання активних користувачів'
      })
    }
  })
}