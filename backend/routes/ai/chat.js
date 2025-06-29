import { authenticateUser } from '../../middleware/auth.js'

export default async function aiChatRoutes(fastify, options) {
  // Get all chat sessions for the current user
  fastify.get('/sessions', {
    preHandler: [authenticateUser],
    schema: {
      querystring: {
        type: 'object',
        properties: {}
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id
      
      let query = fastify.supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      const { data: sessions, error } = await query
      
      if (error) {
        fastify.log.error('Error fetching chat sessions', { error: error.message, userId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch chat sessions',
          message: 'Не вдалося отримати сесії чату'
        })
      }
      
      return {
        success: true,
        sessions: sessions || []
      }
    } catch (error) {
      fastify.log.error('Chat sessions fetch error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання сесій чату'
      })
    }
  })
  
  // Create a new chat session
  fastify.post('/sessions', {
    preHandler: [authenticateUser],
    schema: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id
      const { title = 'New Chat' } = request.body
      
      const { data: session, error } = await fastify.supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: userId,
          title
        })
        .select()
        .single()
      
      if (error) {
        fastify.log.error('Error creating chat session', { error: error.message, userId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to create chat session',
          message: 'Не вдалося створити сесію чату'
        })
      }
      
      return {
        success: true,
        session
      }
    } catch (error) {
      fastify.log.error('Chat session creation error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка створення сесії чату'
      })
    }
  })
  
  // Update a chat session
  fastify.patch('/sessions/:sessionId', {
    preHandler: [authenticateUser],
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params
      const userId = request.user.id
      const updates = {}
      
      if (request.body.title !== undefined) updates.title = request.body.title
      
      // First check if the session belongs to the user
      const { data: existingSession, error: checkError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()
      
      if (checkError || !existingSession) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено або у вас немає до неї доступу'
        })
      }
      
      const { data: updatedSession, error } = await fastify.supabase
        .from('ai_chat_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()
      
      if (error) {
        fastify.log.error('Error updating chat session', { error: error.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to update chat session',
          message: 'Не вдалося оновити сесію чату'
        })
      }
      
      return {
        success: true,
        session: updatedSession
      }
    } catch (error) {
      fastify.log.error('Chat session update error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка оновлення сесії чату'
      })
    }
  })
  
  // Delete a chat session
  fastify.delete('/sessions/:sessionId', {
    preHandler: [authenticateUser],
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
      const userId = request.user.id
      
      // First check if the session belongs to the user
      const { data: existingSession, error: checkError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()
      
      if (checkError || !existingSession) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено або у вас немає до неї доступу'
        })
      }
      
      // Delete the session (messages will be deleted via cascade)
      const { error } = await fastify.supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId)
      
      if (error) {
        fastify.log.error('Error deleting chat session', { error: error.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete chat session',
          message: 'Не вдалося видалити сесію чату'
        })
      }
      
      return {
        success: true,
        message: 'Chat session deleted successfully'
      }
    } catch (error) {
      fastify.log.error('Chat session deletion error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка видалення сесії чату'
      })
    }
  })
  
  // Get messages for a specific chat session
  fastify.get('/sessions/:sessionId/messages', {
    preHandler: [authenticateUser],
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
      const userId = request.user.id
      
      // First check if the session belongs to the user
      const { data: existingSession, error: checkError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('id, title')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()
      
      if (checkError || !existingSession) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено або у вас немає до неї доступу'
        })
      }
      
      const { data: messages, error } = await fastify.supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (error) {
        fastify.log.error('Error fetching chat messages', { error: error.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch chat messages',
          message: 'Не вдалося отримати повідомлення чату'
        })
      }
      
      return {
        success: true,
        session: existingSession,
        messages: messages || []
      }
    } catch (error) {
      fastify.log.error('Chat messages fetch error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання повідомлень чату'
      })
    }
  })
  
  // Add a message to a chat session
  fastify.post('/sessions/:sessionId/messages', {
    preHandler: [authenticateUser],
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' },
          role: { type: 'string', enum: ['user', 'assistant'], default: 'user' },
          metadata: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params
      const userId = request.user.id
      const { content, role = 'user', metadata = {} } = request.body
      
      // First check if the session belongs to the user
      const { data: existingSession, error: checkError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()
      
      if (checkError || !existingSession) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено або у вас немає до неї доступу'
        })
      }
      
      // Add the message
      const { data: message, error } = await fastify.supabase
        .from('ai_chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          metadata
        })
        .select()
        .single()
      
      if (error) {
        fastify.log.error('Error adding chat message', { error: error.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to add chat message',
          message: 'Не вдалося додати повідомлення чату'
        })
      }
      
      // Update the session's updated_at timestamp
      await fastify.supabase
        .from('ai_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
      
      return {
        success: true,
        message
      }
    } catch (error) {
      fastify.log.error('Chat message creation error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка додавання повідомлення чату'
      })
    }
  })
  
  // Generate AI response for a message
  fastify.post('/generate-response', {
    preHandler: [authenticateUser],
    schema: {
      body: {
        type: 'object',
        required: ['sessionId', 'userMessage'],
        properties: {
          sessionId: { type: 'string', format: 'uuid' },
          userMessage: { type: 'string' },
          previousMessages: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['user', 'assistant'] },
                content: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId, userMessage, previousMessages = [] } = request.body
      const userId = request.user.id
      
      // First check if the session belongs to the user
      const { data: existingSession, error: checkError } = await fastify.supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()
      
      if (checkError || !existingSession) {
        return reply.code(404).send({
          success: false,
          error: 'Chat session not found',
          message: 'Сесію чату не знайдено або у вас немає до неї доступу'
        })
      }
      
      // Save user message
      const { data: userMessageData, error: userMessageError } = await fastify.supabase
        .from('ai_chat_messages')
        .insert({
          session_id: sessionId,
          role: 'user',
          content: userMessage
        })
        .select()
        .single()
      
      if (userMessageError) {
        fastify.log.error('Error saving user message', { error: userMessageError.message, sessionId })
        return reply.code(500).send({
          success: false,
          error: 'Failed to save user message',
          message: 'Не вдалося зберегти повідомлення користувача'
        })
      }
      
      // Prepare context for AI
      const context = [
        ...previousMessages,
        { role: 'user', content: userMessage }
      ]
      
      // Generate AI response
      if (!fastify.aiService) {
        return reply.code(503).send({
          success: false,
          error: 'AI service not available',
          message: 'Сервіс AI тимчасово недоступний'
        })
      }
      
      // Use the system instruction for chat
      const systemInstruction = `Ти корисний асистент, який допомагає користувачам з питаннями про кулінарію, страви та інгредієнти.
                                Ти можеш надавати поради щодо приготування, пропонувати страви на основі наявних інгредієнтів,
                                пояснювати кулінарні техніки та відповідати на загальні питання.
                                Форматуй свої відповіді у markdown для кращої читабельності.
                                Будь дружнім, корисним та інформативним.`
      
      // Generate response using Gemini
      try {
        const model = fastify.aiService.gemini.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction
        })
        
        // Format the chat history for Gemini
        const chatHistory = context.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
        
        const chat = model.startChat({
          history: chatHistory.slice(0, -1) // Exclude the last message which we'll send separately
        })
        
        const result = await chat.sendMessage(userMessage)
        const response = await result.response
        const aiResponseText = response.text()
        
        // Save AI response
        const { data: aiMessage, error: aiMessageError } = await fastify.supabase
          .from('ai_chat_messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: aiResponseText
          })
          .select()
          .single()
        
        if (aiMessageError) {
          fastify.log.error('Error saving AI response', { error: aiMessageError.message, sessionId })
          return reply.code(500).send({
            success: false,
            error: 'Failed to save AI response',
            message: 'Не вдалося зберегти відповідь AI'
          })
        }
        
        // Update the session's updated_at timestamp
        await fastify.supabase
          .from('ai_chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId)
        
        return {
          success: true,
          userMessage: userMessageData,
          aiMessage
        }
      } catch (aiError) {
        fastify.log.error('AI response generation error', { error: aiError.message, sessionId })
        
        // Save error message as AI response
        const errorMessage = 'На жаль, сталася помилка при генерації відповіді. Спробуйте ще раз пізніше.'
        
        const { data: errorAiMessage, error: errorAiMessageError } = await fastify.supabase
          .from('ai_chat_messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: errorMessage,
            metadata: { error: true }
          })
          .select()
          .single()
        
        if (errorAiMessageError) {
          fastify.log.error('Error saving AI error response', { error: errorAiMessageError.message, sessionId })
        }
        
        return reply.code(500).send({
          success: false,
          error: 'AI response generation failed',
          message: 'Не вдалося згенерувати відповідь AI',
          errorMessage,
          userMessage: userMessageData,
          aiMessage: errorAiMessage
        })
      }
    } catch (error) {
      fastify.log.error('Generate response error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка генерації відповіді'
      })
    }
  })
}