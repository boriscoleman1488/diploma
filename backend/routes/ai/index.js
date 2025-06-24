import { authenticateUser } from '../../middleware/auth.js'

export default async function aiRoutes(fastify, options) {
  // Ensure the AI service is properly available
  if (!fastify.aiService) {
    throw new Error('AI Service not properly registered')
  }

  // Search ingredients
  fastify.post('/search-ingredients', {
    preHandler: [authenticateUser],
    schema: {
      body: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', minLength: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { query, limit = 5 } = request.body

      // Ensure the service method exists before calling
      if (typeof fastify.aiService.searchIngredients !== 'function') {
        throw new Error('searchIngredients method not available on AI service')
      }

      const result = await fastify.aiService.searchIngredients(query, limit)
      
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: 'Не вдалося знайти інгредієнти'
        })
      }

      return {
        success: true,
        foods: result.foods,
        query
      }
    } catch (error) {
      fastify.log.error('Ingredient search error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Помилка пошуку інгредієнтів'
      })
    }
  })

  // Get recipe suggestions
  fastify.post('/recipe-suggestions', {
    preHandler: [authenticateUser],
    schema: {
      body: {
        type: 'object',
        required: ['ingredients'],
        properties: {
          ingredients: { 
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          preferences: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { ingredients, preferences } = request.body

      // Ensure the service method exists before calling
      if (typeof fastify.aiService.getRecipeSuggestions !== 'function') {
        throw new Error('getRecipeSuggestions method not available on AI service')
      }

      const result = await fastify.aiService.getRecipeSuggestions(ingredients, preferences)
      
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: 'Не вдалося згенерувати рецепти'
        })
      }

      return {
        success: true,
        suggestion: result.suggestion
      }
    } catch (error) {
      fastify.log.error('Recipe suggestion error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Помилка генерації рецептів'
      })
    }
  })
}