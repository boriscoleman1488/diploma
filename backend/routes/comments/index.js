import { authenticateUser } from '../../middleware/auth.js'
import {
    createCommentSchema,
    getCommentsSchema,
    updateCommentSchema
} from '../../schemas/commentSchemas.js'

export default async function commentRoutes(fastify, options) {
    fastify.post('/:dishId', {
        preHandler: [authenticateUser],
        schema: createCommentSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const userId = request.user.id
            const commentData = { ...request.body, dish_id: dishId }

            const result = await fastify.commentService.createComment(userId, commentData)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.code(201).send({
                success: true,
                comment: result.comment
            })
        } catch (error) {
            fastify.log.error('Create comment error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to create comment'
            })
        }
    })

    fastify.get('/:dishId', {
        schema: getCommentsSchema
    }, async (request, reply) => {
        try {
            const { dishId } = request.params
            const { page = 1, limit = 20 } = request.query

            const result = await fastify.commentService.getCommentsByDish(dishId, page, limit)

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
            fastify.log.error('Get comments error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch comments'
            })
        }
    })

    fastify.put('/:commentId', {
        preHandler: [authenticateUser],
        schema: updateCommentSchema
    }, async (request, reply) => {
        try {
            const { commentId } = request.params
            const { content } = request.body
            const userId = request.user.id

            const result = await fastify.commentService.updateComment(commentId, userId, content)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                comment: result.comment
            }
        } catch (error) {
            fastify.log.error('Update comment error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to update comment'
            })
        }
    })

    fastify.delete('/:commentId', {
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { commentId } = request.params
            const userId = request.user.id

            const result = await fastify.commentService.deleteComment(commentId, userId)

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
            fastify.log.error('Delete comment error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete comment'
            })
        }
    })
}