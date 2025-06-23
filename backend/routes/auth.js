import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resendConfirmationSchema
} from '../schemas/authSchemas.js'

export default async function authRoutes(fastify, options) {

  fastify.post('/register', {
    schema: registerSchema
  }, async (request, reply) => {
    const { email, password, fullName } = request.body

    const result = await fastify.authService.register(email, password, fullName)

    if (!result.success) {
      return reply.code(400).send({
        error: result.error,
        message: result.message
      })
    }

    return result
  })

  fastify.post('/login', {
      schema: loginSchema
  }, async (request, reply) => {
      const { email, password } = request.body
      const result = await fastify.authService.login(email, password)
      return handleAuthResponse(result, reply, 200, 401)
  })
  
  fastify.post('/logout', async (request, reply) => {
      const token = extractBearerToken(request, reply)
      if (!token) return
      
      const result = await fastify.authService.logout()
      return handleAuthResponse(result, reply)
  })

  fastify.post('/refresh', {
    schema: refreshTokenSchema
  }, async (request, reply) => {
    const { refreshToken } = request.body

    const result = await fastify.authService.refreshToken(refreshToken)

    if (!result.success) {
      return reply.code(401).send({
        error: result.error,
        message: result.message
      })
    }

    return result
  })

  fastify.post('/forgot-password', {
    schema: forgotPasswordSchema
  }, async (request, reply) => {
    const { email } = request.body

    const result = await fastify.authService.forgotPassword(email)

    if (!result.success) {
      return reply.code(400).send({
        error: result.error,
        message: result.message
      })
    }

    return result
  })

  fastify.post('/resend-confirmation', {
    schema: resendConfirmationSchema
  }, async (request, reply) => {
    const { email } = request.body

    const result = await fastify.authService.resendConfirmation(email)

    if (!result.success) {
      return reply.code(400).send({
        error: result.error,
        message: result.message
      })
    }

    return result
  })

  fastify.get('/verify', async (request, reply) => {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Missing authorization header',
        message: 'Authorization header with Bearer token is required'
      })
    }

    const token = authHeader.substring(7)
    const result = await fastify.authService.verifyToken(token)

    if (!result.success) {
      return reply.code(401).send({
        error: result.error,
        message: result.message
      })
    }

    return result
  })
}

const handleAuthResponse = (result, reply, successCode = 200, errorCode = 400) => {
    if (!result.success) {
        return reply.code(errorCode).send({
            error: result.error,
            message: result.message
        })
    }
    return reply.code(successCode).send(result)
}

const extractBearerToken = (request, reply) => {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
            error: 'Missing authorization header',
            message: 'Authorization header with Bearer token is required'
        })
    }
    
    return authHeader.substring(7)
}
