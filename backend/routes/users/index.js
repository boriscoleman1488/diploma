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
            const result = await fastify.userService.getPublicProfile(userId)

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
            const result = await fastify.userService.getUserStats(request.user)

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
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            fastify.log.info('Avatar upload request received', { 
                userId: request.user.id,
                contentType: request.headers['content-type']
            })

            const data = await request.file()

            if (!data) {
                fastify.log.warn('No file provided in avatar upload', { userId: request.user.id })
                return reply.code(400).send({
                    success: false,
                    error: 'No file provided',
                    message: 'Будь ласка, оберіть файл зображення'
                })
            }

            fastify.log.info('File received for avatar upload', {
                userId: request.user.id,
                filename: data.filename,
                mimetype: data.mimetype,
                encoding: data.encoding
            })

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(data.mimetype)) {
                fastify.log.warn('Invalid file type for avatar upload', {
                    userId: request.user.id,
                    mimetype: data.mimetype,
                    allowedTypes
                })
                return reply.code(400).send({
                    success: false,
                    error: 'Invalid file type',
                    message: 'Дозволені тільки файли JPG, PNG та WebP'
                })
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024 // 5MB
            const buffer = await data.toBuffer()
            
            fastify.log.info('File buffer created', {
                userId: request.user.id,
                bufferSize: buffer.length,
                maxSize
            })
            
            if (buffer.length > maxSize) {
                fastify.log.warn('File too large for avatar upload', {
                    userId: request.user.id,
                    fileSize: buffer.length,
                    maxSize
                })
                return reply.code(400).send({
                    success: false,
                    error: 'File too large',
                    message: 'Розмір файлу не повинен перевищувати 5МБ'
                })
            }

            const result = await fastify.userService.uploadAvatar(
                request.user.id,
                buffer,
                data.mimetype,
                data.filename
            )

            if (!result.success) {
                fastify.log.error('Avatar upload service failed', {
                    userId: request.user.id,
                    error: result.error,
                    message: result.message
                })
                return reply.code(400).send({
                    success: false,
                    error: result.error,
                    message: result.message
                })
            }

            fastify.log.info('Avatar upload completed successfully', {
                userId: request.user.id,
                avatarUrl: result.avatarUrl
            })

            return reply.send({
                success: true,
                avatarUrl: result.avatarUrl,
                profile: result.profile,
                message: 'Аватар завантажено успішно'
            })
        } catch (error) {
            fastify.log.error('Avatar upload error', {
                error: error.message,
                stack: error.stack,
                userId: request.user?.id
            })
            return reply.code(500).send({
                success: false,
                error: 'Internal server error',
                message: 'Не вдалося завантажити аватар'
            })
        }
    })

    fastify.get('/search/:tag', {
        handler: async (request, reply) => {
            const { tag } = request.params
            const result = await fastify.userService.getUserByTag(tag)

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