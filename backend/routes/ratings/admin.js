import { authenticateUser, requireAdmin } from '../../middleware/auth.js'
import {
    getRatingsSchema,
    deleteRatingSchema,
} from '../../schemas/ratingSchemas.js'

export default async function ratingAdminRoutes(fastify, options) {
    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getRatingsSchema
    }, async (request, reply) => {
        try {
            const { page = 1, limit = 20, dishId, userId } = request.query
            const result = await fastify.ratingService.getAllRatingsForAdmin({ page, limit, dishId, userId })

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                ratings: result.ratings,
                total: result.total
            }
        } catch (error) {
            fastify.log.error('Get ratings for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch ratings'
            })
        }
    })

    fastify.get('/:ratingId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['ratingId'],
                properties: {
                    ratingId: {
                        type: 'string',
                        format: 'uuid'
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { ratingId } = request.params
            const result = await fastify.ratingService.getRatingDetailsForAdmin(ratingId)

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
            fastify.log.error('Get rating details error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch rating details'
            })
        }
    })

    fastify.delete('/:ratingId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: deleteRatingSchema
    }, async (request, reply) => {
        try {
            const { ratingId } = request.params
            const result = await fastify.ratingService.deleteRatingByAdmin(ratingId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: 'Rating deleted successfully'
            }
        } catch (error) {
            fastify.log.error('Delete rating error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete rating'
            })
        }
    })

    fastify.get('/stats/overview', {
        preHandler: [authenticateUser, requireAdmin]
    }, async (request, reply) => {
        try {
            const result = await fastify.ratingService.getRatingStats()

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
            fastify.log.error('Get rating stats error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch rating statistics'
            })
        }
    })
}