import { EdamamService } from '../../services/edamamService.js'

export default async function edamamRoutes(fastify, options) {
  // Search foods using Edamam API
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

      const result = await fastify.edamam.searchFood(query, limit)

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
        query: query
      }
    } catch (error) {
      fastify.log.error('Edamam search error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка пошуку інгредієнтів'
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
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка отримання інформації про інгредієнт'
      })
    }
  })

  // Analyze nutrition for a recipe
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
                unit: { type: 'string', minLength: 1 }
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
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: 'Не вдалося проаналізувати поживну цінність'
        })
      }

      return {
        success: true,
        nutrition: result.nutrition
      }
    } catch (error) {
      fastify.log.error('Nutrition analysis error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка аналізу поживної цінності'
      })
    }
  })

  // Analyze nutrition for ingredients list (simplified)
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
                unit: { type: 'string', minLength: 1 }
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
        return reply.code(400).send({
          success: false,
          error: result.error,
          message: 'Не вдалося проаналізувати інгредієнти'
        })
      }

      return {
        success: true,
        nutrition: result.nutrition
      }
    } catch (error) {
      fastify.log.error('Ingredients analysis error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Помилка аналізу інгредієнтів'
      })
    }
  })
}