import { authenticateUser, requireAdmin } from '../../middleware/auth.js'
import {
    getCommentsSchema,
    deleteCommentSchema,
} from '../../schemas/commentSchemas.js'

export default async function commentAdminRoutes(fastify, options) {
    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getCommentsSchema
    }, async (request, reply) => {
        try {
            const { page = 1, limit = 20, status } = request.query
            const result = await fastify.commentService.getAllCommentsForAdmin({ page, limit, status })

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                comments: result.comments,
                total: result.total
            }
        } catch (error) {
            fastify.log.error('Get comments for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch comments'
            })
        }
    })

    fastify.get('/:commentId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['commentId'],
                properties: {
                    commentId: {
                        type: 'string',
                        format: 'uuid'
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { commentId } = request.params
            const result = await fastify.commentService.getCommentDetailsForAdmin(commentId)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                comment: result.comment
            }
        } catch (error) {
            fastify.log.error('Get comment details for admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch comment details'
            })
        }
    })

    fastify.delete('/:commentId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: deleteCommentSchema
    }, async (request, reply) => {
        try {
            const { commentId } = request.params
            const result = await fastify.commentService.deleteCommentByAdmin(commentId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: result.message
            }
        } catch (error) {
            fastify.log.error('Delete comment by admin error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete comment'
            })
        }
    })

    fastify.get('/stats', {
        preHandler: [authenticateUser, requireAdmin]
    }, async (request, reply) => {
        try {
            const result = await fastify.commentService.getCommentStats()

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
            fastify.log.error('Get comment stats error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch comment statistics'
            })
        }
    })
}