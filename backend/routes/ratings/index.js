import { authenticateUser } from '../../middleware/auth.js'
import {
    setRatingSchema,
    getRatingSchema
} from '../../schemas/ratingSchemas.js'

export default async function ratingRoutes(fastify, options) {
    fastify.post('/:dishId', {
        schema: setRatingSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const { rating } = request.body  // Тепер це число 0 або 1
            const userId = request.user.id

            const result = await fastify.ratingService.setRating(dishId, userId, rating)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.code(201).send({
                success: true,
                action: result.action,
                rating: rating
            })
        } catch (error) {
            fastify.log.error('Set rating error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to set rating'
            })
        }
    })
    
    fastify.get('/:dishId', {
        schema: getRatingSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params

            const result = await fastify.ratingService.getDishRatingStats(dishId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                stats: result.stats
            }
        } catch (error) {
            fastify.log.error('Get dish rating stats error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch rating stats'
            })
        }
    })


    fastify.get('/dishes/:dishId/my-rating', {
        preHandler: [authenticateUser],
        schema: {
            params: {
                type: 'object',
                required: ['dishId'],
                properties: {
                    dishId: {
                        type: 'string',
                        format: 'uuid'
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const userId = request.user.id

            const result = await fastify.ratingService.getUserRating(dishId, userId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                rating: result.rating
            }
        } catch (error) {
            fastify.log.error('Get user rating error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch user rating'
            })
        }
    })
    
    fastify.delete('/:dishId', {
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const userId = request.user.id
    
            const result = await fastify.ratingService.removeLike(dishId, userId)
    
            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }
    
            return reply.code(200).send({
                message: 'Like removed successfully'
            })
        } catch (error) {
            fastify.log.error('Error removing like:', error)
            return reply.code(500).send({
                error: 'Unable to remove like',
                message: error.message
            })
        }
    })
}