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
    try {
      const { email, password, fullName } = request.body

      const result = await fastify.authService.register(email, password, fullName)

      if (!result.success) {
        return reply.code(400).send({
          error: result.error,
          message: result.message
        })
      }

      return reply.code(201).send(result)
    } catch (error) {
      fastify.log.error('Registration error', { error: error.message })
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Помилка реєстрації'
      })
    }
  })

  fastify.post('/login', {
      schema: loginSchema
  }, async (request, reply) => {
      try {
        const { email, password } = request.body
        const result = await fastify.authService.login(email, password)
        return handleAuthResponse(result, reply, 200, 401)
      } catch (error) {
        fastify.log.error('Login error', { error: error.message })
        return reply.code(500).send({
          error: 'Internal server error',
          message: 'Помилка входу'
        })
      }
  })
  
  fastify.post('/logout', async (request, reply) => {
      try {
        const result = await fastify.authService.logout()
        return handleAuthResponse(result, reply)
      } catch (error) {
        fastify.log.error('Logout error', { error: error.message })
        return reply.code(500).send({
          error: 'Internal server error',
          message: 'Помилка виходу'
        })
      }
  })

  fastify.post('/refresh', {
    schema: refreshTokenSchema
  }, async (request, reply) => {
    try {
      const { refresh_token } = request.body

      const result = await fastify.authService.refreshToken(refresh_token)

      if (!result.success) {
        return reply.code(401).send({
          error: result.error,
          message: result.message
        })
      }

      return result
    } catch (error) {
      fastify.log.error('Token refresh error', { error: error.message })
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Помилка оновлення токена'
      })
    }
  })

  fastify.post('/forgot-password', {
    schema: forgotPasswordSchema
  }, async (request, reply) => {
    try {
      const { email } = request.body

      const result = await fastify.authService.forgotPassword(email)

      if (!result.success) {
        return reply.code(400).send({
          error: result.error,
          message: result.message
        })
      }

      return result
    } catch (error) {
      fastify.log.error('Forgot password error', { error: error.message })
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Помилка скидання пароля'
      })
    }
  })

  fastify.post('/resend-confirmation', {
    schema: resendConfirmationSchema
  }, async (request, reply) => {
    try {
      const { email } = request.body

      const result = await fastify.authService.resendConfirmation(email)

      if (!result.success) {
        return reply.code(400).send({
          error: result.error,
          message: result.message
        })
      }

      return result
    } catch (error) {
      fastify.log.error('Resend confirmation error', { error: error.message })
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Помилка повторної відправки підтвердження'
      })
    }
  })

  fastify.get('/verify', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Missing authorization header',
          message: 'Відсутній заголовок авторизації'
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
    } catch (error) {
      fastify.log.error('Token verification error', { error: error.message })
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Помилка перевірки токена'
      })
    }
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