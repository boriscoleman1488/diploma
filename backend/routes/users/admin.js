import { authenticateUser, requireAdmin } from '../../middleware/auth.js'

export default async function userAdminRoutes(fastify, options) {
    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
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

    fastify.get('/:userId', {
        preHandler: [authenticateUser, requireAdmin],
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

    fastify.put('/role/:userId', {
        preHandler: [authenticateUser, requireAdmin],
        handler: async (request, reply) => {
            const { userId } = request.params
            const { role } = request.body

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

    fastify.delete('/:userId', {
        preHandler: [authenticateUser, requireAdmin],
        handler: async (request, reply) => {
            const { userId } = request.params

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

}