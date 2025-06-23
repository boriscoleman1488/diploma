import { authenticateUser } from '../../middleware/auth.js'
import {
    createCollectionSchema,
    addDishToCollectionSchema,
    removeDishFromCollectionSchema,
    getCollectionSchema,
    getDishesByTypeSchema
} from '../../schemas/collectionSchemas.js'

export default async function collectionRoutes(fastify, options) {
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

    fastify.get('/type/:type', {
        schema: getDishesByTypeSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { userId } = request.user
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

    fastify.post('/', {
        schema: createCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { userId } = request.user
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

    fastify.post('/dishes/:collectionId', {
        schema: addDishToCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { userId } = request.user
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

    fastify.delete('/:collectionId/dishes/:dishId', {
        schema: removeDishFromCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { userId } = request.user
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

    fastify.delete('/:collectionId', {
        schema: getCollectionSchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { userId } = request.user
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
