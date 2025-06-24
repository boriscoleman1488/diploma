import { authenticateUser } from '../../middleware/auth.js'
import {
    createCollectionSchema,
    addDishToCollectionSchema,
    removeDishFromCollectionSchema,
    getCollectionSchema,
    getDishesByTypeSchema,
    updateCollectionSchema
} from '../../schemas/collectionSchemas.js'

export default async function collectionRoutes(fastify, options) {
    // Get all user collections
    fastify.get('/', {
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const result = await fastify.collectionService.getUserCollections(userId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                collections: result.collections
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch collections'
            })
        }
    })

    // Get collection by ID with dishes
    fastify.get('/:collectionId', {
        preHandler: [authenticateUser],
        schema: {
            params: {
                type: 'object',
                required: ['collectionId'],
                properties: {
                    collectionId: { type: 'string', format: 'uuid' }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { collectionId } = request.params
            const userId = request.user.id
            
            const result = await fastify.collectionService.getCollectionWithDishes(userId, collectionId)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                collection: result.collection,
                dishes: result.dishes
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch collection'
            })
        }
    })

    // Get dishes by system collection type
    fastify.get('/type/:type', {
        schema: getDishesByTypeSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const { type } = request.params

            const result = await fastify.collectionService.getDishesByType(userId, type)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                dishes: result.dishes
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch dishes'
            })
        }
    })

    // Create new collection
    fastify.post('/', {
        schema: createCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const result = await fastify.collectionService.createCollection(userId, request.body)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.code(201).send({
                success: true,
                collection: result.collection
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to create collection'
            })
        }
    })

    // Update collection
    fastify.put('/:collectionId', {
        schema: updateCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const { collectionId } = request.params
            
            const result = await fastify.collectionService.updateCollection(userId, collectionId, request.body)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                collection: result.collection
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to update collection'
            })
        }
    })

    // Add dish to collection
    fastify.post('/dishes/:collectionId', {
        schema: addDishToCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const { collectionId } = request.params
            const { dishId } = request.body

            const result = await fastify.collectionService.addDishToCollection(userId, collectionId, dishId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.code(201).send({
                success: true,
                item: result.item
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to add dish to collection'
            })
        }
    })

    // Remove dish from collection
    fastify.delete('/:collectionId/dishes/:dishId', {
        schema: removeDishFromCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const { collectionId, dishId } = request.params

            const result = await fastify.collectionService.removeDishFromCollection(userId, collectionId, dishId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to remove dish from collection'
            })
        }
    })

    // Delete collection
    fastify.delete('/:collectionId', {
        schema: getCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const userId = request.user.id
            const { collectionId } = request.params

            const result = await fastify.collectionService.deleteCollection(userId, collectionId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete collection'
            })
        }
    })
}