import { authenticateUser, requireAdmin } from '../../middleware/auth.js'

export default async function userAdminRoutes(fastify, options) {
    // Get all users with pagination and search
    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
                    search: { type: 'string' }
                }
            }
        },
        handler: async (request, reply) => {
            const { page = 1, limit = 10, search } = request.query
            const result = await fastify.userService.getAllUsers(page, limit, search)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })

    // Get specific user details
    fastify.get('/:userId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string', format: 'uuid' }
                }
            }
        },
        handler: async (request, reply) => {
            const { userId } = request.params
            const result = await fastify.userService.getUserDetailsForAdmin(userId)

            if (!result.success) {
                return reply.code(404).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })

    // Update user role
    fastify.put('/role/:userId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                required: ['role'],
                properties: {
                    role: { 
                        type: 'string',
                        enum: ['user', 'admin']
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { userId } = request.params
            const { role } = request.body

            // Prevent admin from changing their own role
            if (userId === request.user.id) {
                return reply.code(400).send({
                    error: 'Cannot modify own role',
                    message: 'Ви не можете змінити власну роль'
                })
            }

            const result = await fastify.userService.updateUserRole(userId, role)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })

    // Delete user
    fastify.delete('/:userId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string', format: 'uuid' }
                }
            }
        },
        handler: async (request, reply) => {
            const { userId } = request.params

            // Prevent admin from deleting themselves
            if (userId === request.user.id) {
                return reply.code(400).send({
                    error: 'Cannot delete yourself',
                    message: 'Ви не можете видалити власний акаунт'
                })
            }

            const result = await fastify.userService.deleteUserByAdmin(userId)

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })

    // Get user statistics
    fastify.get('/stats', {
        preHandler: [authenticateUser, requireAdmin],
        handler: async (request, reply) => {
            const result = await fastify.userService.getSystemStats()

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.send(result)
        }
    })
}