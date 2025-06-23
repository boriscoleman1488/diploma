import { authenticateUser, requireAdmin } from '../../middleware/auth.js'
import {
    getDishesSchema,
    moderateDishSchema,
    getDishSchema,
    deleteDishSchema
} from '../../schemas/dishSchemas.js'

export default async function dishAdminRoutes(fastify, options) {
    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getDishesSchema
    }, async (request, reply) => {
        try {
            const result = await fastify.dishService.getAllDishesForAdmin()

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                dishes: result.dishes,
                total: result.dishes.length
            }
        } catch (error) {
            fastify.log.error('Get dishes for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch dishes'
            })
        }
    })

    fastify.get('/:dishId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getDishSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params

            const result = await fastify.dishService.getDishDetailsForAdmin(dishId)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                dish: result.dish
            }
        } catch (error) {
            fastify.log.error('Get dish details for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch dish details'
            })
        }
    })

    fastify.patch('/moderate/:dishId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: moderateDishSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const { status, rejection_reason } = request.body

            const result = await fastify.dishService.moderateDish(dishId, status, rejection_reason)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Moderation error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to moderate dish'
            })
        }
    })


    fastify.get('/stats', {
        preHandler: [authenticateUser, requireAdmin]
    }, async (request, reply) => {
        try {
            const result = await fastify.dishService.getDishStats()

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Get dish stats error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch dish statistics'
            })
        }
    })

    fastify.delete('/:dishId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: deleteDishSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params

            const result = await fastify.dishService.deleteDishByAdmin(dishId)

            if (!result.success) {
                return reply.code(result.error === 'Dish not found' ? 404 : 400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: 'Dish deleted successfully by admin'
            }
        } catch (error) {
            fastify.log.error('Admin delete dish error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete dish'
            })
        }
    })
}