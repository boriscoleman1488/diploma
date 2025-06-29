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
                // Return 404 for dish not found scenarios
                const statusCode = result.error === 'Dish not found' || 
                                 result.message?.includes('not found') || 
                                 result.message?.includes('Unable to fetch dish') ? 404 : 400
                
                return reply.code(statusCode).send({
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

    // New route for fetching user's own dish for editing
    fastify.get('/:dishId/edit', {
        schema: getDishSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const userId = request.user.id

            const result = await fastify.dishService.getDishByIdForUser(dishId, userId)

            if (!result.success) {
                const statusCode = result.error === 'Dish not found' || 
                                 result.message?.includes('not found') || 
                                 result.message?.includes('permission') ? 404 : 400
                
                return reply.code(statusCode).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                dish: result.dish
            }
        } catch (error) {
            fastify.log.error('Get user dish for edit error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: error.message
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

    // Upload main dish image
    fastify.post('/upload-image', {
        preHandler: [authenticateUser],
    }, async (request, reply) => {
        try {
            const data = await request.file()

            if (!data) {
                return reply.code(400).send({
                    error: 'No file provided',
                    message: 'Будь ласка, оберіть зображення для завантаження'
                })
            }

            const buffer = await data.toBuffer()
            const result = await fastify.dishService.uploadDishImage(request.user.id, buffer, data.mimetype, data.filename)

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

    // Upload step image
    fastify.post('/upload-step-image', {
        preHandler: [authenticateUser],
    }, async (request, reply) => {
        try {
            const data = await request.file()

            if (!data) {
                return reply.code(400).send({
                    error: 'No file provided',
                    message: 'Будь ласка, оберіть зображення для завантаження'
                })
            }

            const buffer = await data.toBuffer()
            const result = await fastify.dishService.uploadStepImage(request.user.id, buffer, data.mimetype, data.filename)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Step image upload error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to upload step image'
            })
        }
    })
    fastify.get('/my-dishes', {
        preHandler: [authenticateUser],
        schema: getDishesSchema
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const result = await fastify.dishService.getUserDishes(userId)
    
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
            fastify.log.error('Get user dishes error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch user dishes'
            })
        }
    })
}