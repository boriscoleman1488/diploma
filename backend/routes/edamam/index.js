import { EdamamService } from '../../services/edamamService.js'

export default async function edamamRoutes(fastify, options) {
  // Search foods using Edamam Food Database API
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', minLength: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { query, limit = 20 } = request.query

      if (!fastify.edamam) {
        return reply.code(503).send({
          success: false,
          error: 'Edamam service not available',
          message: 'Сервіс пошуку інгредієнтів тимчасово недоступний'
        })
      }

      // Validate query length
      if (query.length < 2) {
        return reply.code(400).send({
          success: false,
          error: 'Запит занадто короткий',
          message: 'Введіть принаймні 2 символи для пошуку'
        })
      }

      const result = await fastify.edamam.searchFood(query, limit)

      if (!result.success) {
        // Check for rate limit error
        if (result.error && result.error.includes('rate limit exceeded')) {
          return reply.code(429).send({
            success: false,
            error: result.error,
            message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
          })
        }
        
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: result.error || 'Не вдалося знайти інгредієнти'
        })
      }

      return {
        success: true,
        foods: result.foods,
        query: query
      }
    } catch (error) {
      fastify.log.error('Edamam search error', { error: error.message })
      
      // Check for rate limit error
      if (error.message && error.message.includes('rate limit exceeded')) {
        return reply.code(429).send({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
        })
      }
      
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: `Помилка пошуку інгредієнтів: ${error.message}`
      })
    }
  })

  // Get detailed nutritional information for a specific food
  fastify.get('/food/:foodId', {
    schema: {
      params: {
        type: 'object',
        required: ['foodId'],
        properties: {
          foodId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { foodId } = request.params

      if (!fastify.edamam) {
        return reply.code(503).send({
          success: false,
          error: 'Edamam service not available',
          message: 'Сервіс інформації про інгредієнти тимчасово недоступний'
        })
      }

      const result = await fastify.edamam.getFoodDetails(foodId)

      if (!result.success) {
        // Check for rate limit error
        if (result.error && result.error.includes('rate limit exceeded')) {
          return reply.code(429).send({
            success: false,
            error: result.error,
            message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
          })
        }
        
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: 'Не вдалося отримати інформацію про інгредієнт'
        })
      }

      return {
        success: true,
        nutrients: result.nutrients,
        calories: result.calories,
        weight: result.weight
      }
    } catch (error) {
      fastify.log.error('Edamam food details error', { error: error.message })
      
      // Check for rate limit error
      if (error.message && error.message.includes('rate limit exceeded')) {
        return reply.code(429).send({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
        })
      }
      
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: `Помилка отримання інформації про інгредієнт: ${error.message}`
      })
    }
  })

  // Analyze nutrition for a recipe using Nutrition Analysis API
  fastify.post('/analyze-nutrition', {
    schema: {
      body: {
        type: 'object',
        required: ['ingredients'],
        properties: {
          ingredients: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['name', 'amount', 'unit'],
              properties: {
                name: { type: 'string', minLength: 1 },
                amount: { type: 'number', minimum: 0 },
                unit: { type: 'string', minLength: 1 },
                edamam_food_id: { type: 'string' }
              }
            }
          },
          servings: { type: 'integer', minimum: 1, default: 1 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { ingredients, servings = 1 } = request.body

      if (!fastify.edamam) {
        return reply.code(503).send({
          success: false,
          error: 'Edamam service not available',
          message: 'Сервіс аналізу поживності тимчасово недоступний'
        })
      }

      const result = await fastify.edamam.analyzeRecipeNutrition({
        ingredients,
        servings
      })

      if (!result.success) {
        // Check for rate limit error
        if (result.error && result.error.includes('rate limit exceeded')) {
          return reply.code(429).send({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
          })
        }
        
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: `Не вдалося проаналізувати поживну цінність: ${result.error}`
        })
      }

      return {
        success: true,
        nutrition: result.nutrition,
        limitApplied: result.nutrition.limitApplied,
        originalCount: result.nutrition.originalCount,
        analyzedCount: result.nutrition.analyzedCount,
        message: result.nutrition.message
      }
    } catch (error) {
      fastify.log.error('Nutrition analysis error', { error: error.message })
      
      // Check for rate limit error
      if (error.message && error.message.includes('rate limit exceeded')) {
        return reply.code(429).send({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
        })
      }
      
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: `Помилка аналізу поживної цінності: ${error.message}`
      })
    }
  })

  // Analyze nutrition for ingredients list (simplified endpoint)
  fastify.post('/analyze-ingredients', {
    schema: {
      body: {
        type: 'object',
        required: ['ingredients'],
        properties: {
          ingredients: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['name', 'amount', 'unit'],
              properties: {
                name: { type: 'string', minLength: 1 },
                amount: { type: 'number', minimum: 0 },
                unit: { type: 'string', minLength: 1 },
                edamam_food_id: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { ingredients } = request.body

      if (!fastify.edamam) {
        return reply.code(503).send({
          success: false,
          error: 'Edamam service not available',
          message: 'Сервіс аналізу поживності тимчасово недоступний'
        })
      }

      const result = await fastify.edamam.analyzeNutrition(ingredients)

      if (!result.success) {
        // Check for rate limit error
        if (result.error && result.error.includes('rate limit exceeded')) {
          return reply.code(429).send({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
          })
        }
        
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: `Не вдалося проаналізувати інгредієнти: ${result.error}`
        })
      }

      return {
        success: true,
        nutrition: result.nutrition,
        limitApplied: result.limitApplied,
        originalCount: result.originalCount,
        analyzedCount: result.analyzedCount,
        message: result.message
      }
    } catch (error) {
      fastify.log.error('Ingredients analysis error', { error: error.message })
      
      // Check for rate limit error
      if (error.message && error.message.includes('rate limit exceeded')) {
        return reply.code(429).send({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше.'
        })
      }
      
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: `Помилка аналізу інгредієнтів: ${error.message}`
      })
    }
  })
}