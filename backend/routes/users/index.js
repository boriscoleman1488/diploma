import { authenticateUser } from '../../middleware/auth.js'
import { updateProfileSchema, getUserSchema, searchUsersSchema, changePasswordSchema, searchByTagSchema } from '../../schemas/userSchemas.js'

export default async function userRoutes(fastify, options) {
    fastify.get('/profile', {
        preHandler: [authenticateUser],
        handler: async (request, reply) => {
            const result = await fastify.userService.getProfile(request.user.id)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                profile: result.profile
            })
        }
    })

    fastify.put('/profile', {
        preHandler: [authenticateUser],
        schema: {
            body: updateProfileSchema.body
        },
        handler: async (request, reply) => {
            const result = await fastify.userService.updateProfile(
                request.user.id,
                request.user.email,
                request.body
            )

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })

    fastify.get('/profile/:userId', {
        handler: async (request, reply) => {
            const { userId } = request.params
            const result = await userService.getPublicProfile(userId)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                profile: result.profile
            })
        }
    })

    fastify.get('/stats', {
        preHandler: [authenticateUser],
        handler: async (request, reply) => {
            const result = await userService.getUserStats(request.user)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                stats: result.stats
            })
        }
    })

    fastify.put('/password', {
        preHandler: [authenticateUser],
        schema: changePasswordSchema
    }, async (request, reply) => {
        try {
            const result = await fastify.userService.changePassword(
                request.user.email,
                request.body.currentPassword,
                request.body.newPassword
            )

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Password update error', {
                error: error.message,
                userId: request.user.id
            })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to update password'
            })
        }
    })

    fastify.post('/avatar', {
        preHandler: [authenticateUser],
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary'
                }
            }
        },
        handler: async (request, reply) => {
            if (!request.file) {
                return reply.code(400).send({
                    error: 'No file uploaded',
                    message: 'Please select an image file'
                })
            }

            const result = await userService.uploadAvatar(
                request.user.id,
                request.file.buffer,
                request.file.mimetype
            )

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })

    fastify.get('/search/:tag', {
        handler: async (request, reply) => {
            const { tag } = request.params
            const result = await userService.getUserByTag(tag)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send({
                success: true,
                profile: result.profile
            })
        }
    })

}