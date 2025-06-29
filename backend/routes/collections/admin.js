import { authenticateUser, requireAdmin } from '../../middleware/auth.js'
import {
    getAllCollectionsForAdminSchema,
    getCollectionDetailsForAdminSchema
} from '../../schemas/collectionSchemas.js'

export default async function collectionAdminRoutes(fastify, options) {
    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getAllCollectionsForAdminSchema
    }, async (request, reply) => {
        try {
            const { page = 1, limit = 20, user_id } = request.query
            const result = await fastify.collectionService.getAllCollectionsForAdmin({
                page,
                limit,
                user_id
            })

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                collections: result.collections,
                total: result.total
            }
        } catch (error) {
            fastify.log.error('Get collections for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch collections'
            })
        }
    })

    fastify.get('/:collectionId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getCollectionDetailsForAdminSchema
    }, async (request, reply) => {
        try {
            const { collectionId } = request.params
            const result = await fastify.collectionService.getCollectionDetailsForAdmin(collectionId)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                collection: result.collection
            }
        } catch (error) {
            fastify.log.error('Get collection details for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch collection details'
            })
        }
    })

    fastify.get('/stats', {
        preHandler: [authenticateUser, requireAdmin]
    }, async (request, reply) => {
        try {
            const result = await fastify.collectionService.getCollectionStats()

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
            fastify.log.error('Get collection stats error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch collection statistics'
            })
        }
    })
}