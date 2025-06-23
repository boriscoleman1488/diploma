import { authenticateUser } from '../../middleware/auth.js'
import {
    getDishesSchema,
    createDishSchema,
    updateDishSchema,
    deleteDishSchema,
    getDishSchema,
} from '../../schemas/dishSchemas.js'

export default async function dishRoutes(fastify, options) {
    fastify.get('/', {
        schema: getDishesSchema
    }, async (request, reply) => {
        try {
            const result = await fastify.dishService.getDishes()

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
            fastify.log.error('Get dishes error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch dishes'
            })
        }
    })

    fastify.get('/:dishId', {
        schema: getDishSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params

            const result = await fastify.dishService.getDishById(dishId)

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
            fastify.log.error('Get dish error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch dish'
            })
        }
    })

    fastify.post('/', {
        schema: createDishSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const result = await fastify.dishService.createDish(userId, request.body)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.code(201).send({
                success: true,
                message: result.message,
                dish: result.dish
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: error.message
            })
        }
    })

    fastify.put('/:dishId', {
        preHandler: [authenticateUser],
        schema: updateDishSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params

            const result = await fastify.dishService.updateDish(dishId, request.user.id, request.body)

            if (!result.success) {
                return reply.code(result.error === 'Dish not found' ? 404 : 400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: 'Dish updated successfully',
                dish: result.dish
            }
        } catch (error) {
            fastify.log.error('Update dish error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to update dish'
            })
        }
    })

    fastify.patch('/:dishId/status', {
        preHandler: [authenticateUser],
        schema: {
            params: {
                type: 'object',
                required: ['dishId'],
                properties: {
                    dishId: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                required: ['action'],
                properties: {
                    action: {
                        type: 'string',
                        enum: ['submit_for_review']
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const { action } = request.body
            const userId = request.user.id

            const result = await fastify.dishService.updateDishStatus(dishId, userId, action)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: result.message,
                dish: result.dish
            }
        } catch (error) {
            fastify.log.error('Update dish status error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to update dish status'
            })
        }
    })

    fastify.delete('/:dishId', {
        preHandler: [authenticateUser],
        schema: deleteDishSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params

            const result = await fastify.dishService.deleteDish(dishId, request.user.id)

            if (!result.success) {
                return reply.code(result.error === 'Dish not found' ? 404 : 403).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: 'Dish deleted successfully'
            }
        } catch (error) {
            fastify.log.error('Delete dish error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete dish'
            })
        }
    })


    fastify.post('/upload-image', {
        preHandler: [authenticateUser],
    }, async (request, reply) => {
        try {
            const data = await request.file()

            if (!data) {
                return reply.code(400).send({
                    error: 'No file provided',
                    message: 'Please select an image to upload'
                })
            }

            const buffer = await data.toBuffer()
            const result = await fastify.dishService.uploadDishImage(request.user.id, buffer, data.mimetype)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Image upload error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to upload image'
            })
        }
    })
}
