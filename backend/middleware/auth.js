export const authenticateUser = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Access token required',
        message: 'Please provide Authorization header with Bearer token'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error } = await request.server.supabase.auth.getUser(token)

    if (error || !user) {
      request.log.error('Authentication failed', { error: error?.message })
      return reply.code(401).send({
        error: 'Invalid token',
        message: 'Please log in again'
      })
    }

    request.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role || 'authenticated',
      emailConfirmed: user.email_confirmed_at !== null,
      lastSignIn: user.last_sign_in_at,
      metadata: user.user_metadata
    }

    request.log.info('User authenticated', {
      userId: request.user.id,
      email: request.user.email
    })

  } catch (error) {
    request.log.error('Authentication error', { error: error.message })
    return reply.code(401).send({
      error: 'Authentication failed',
      message: 'Unable to verify token'
    })
  }
}

// Новий middleware для блокування авторизованих користувачів
export const blockAuthenticatedUsers = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      const { data: { user }, error } = await request.server.supabase.auth.getUser(token)
      
      if (!error && user) {
        return reply.code(403).send({
          error: 'Already authenticated',
          message: 'You are already logged in. Please logout first to access this page.',
          redirectTo: '/user'
        })
      }
    }
    
    // Якщо токен відсутній або недійсний, дозволяємо доступ
  } catch (error) {
    // Якщо помилка при перевірці токена, дозволяємо доступ
    request.log.info('Token validation failed, allowing access to auth page', { error: error.message })
  }
}

export const requireRole = (requiredRole) => {
  return async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Authentication required',
        message: 'Please log in first'
      })
    }

    try {
      const { data: profile, error } = await request.server.supabase
        .from('profiles')
        .select('role')
        .eq('id', request.user.id)
        .maybeSingle()

      if (error) {
        request.log.error('Failed to fetch user profile', { error: error.message, userId: request.user.id })
        return reply.code(500).send({
          error: 'Profile fetch failed',
          message: 'Unable to verify user permissions'
        })
      }

      if (!profile) {
        request.log.warn('No profile found for user', { userId: request.user.id })
        return reply.code(403).send({
          error: 'Profile not found',
          message: 'User profile must be created before accessing this resource'
        })
      }

      const userRole = profile.role

      if (userRole !== requiredRole) {
        return reply.code(403).send({
          error: 'Insufficient permissions',
          message: `Required role: ${requiredRole}, your role: ${userRole || 'none'}`
        })
      }

      request.user.role = userRole

    } catch (error) {
      request.log.error('Error checking user role', { error: error.message, userId: request.user.id })
      return reply.code(500).send({
        error: 'Permission check failed',
        message: error.message
      })
    }
  }
}

export const requireAdmin = async (request, reply) => {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Authentication required',
      message: 'Please log in first'
    })
  }

  try {
    const { data: profile, error } = await request.server.supabase
      .from('profiles')
      .select('role')
      .eq('id', request.user.id)
      .maybeSingle()

    if (error) {
      request.log.error('Failed to fetch user profile', { error: error.message, userId: request.user.id })
      return reply.code(500).send({
        error: 'Profile fetch failed',
        message: error.message
      })
    }

    if (!profile) {
      request.log.warn('No profile found for user', { userId: request.user.id })
      return reply.code(403).send({
        error: 'Profile not found',
        message: 'User profile must be created before accessing admin resources'
      })
    }

    const userRole = profile.role
    const isAdmin = userRole === 'admin'

    if (!isAdmin) {
      return reply.code(403).send({
        error: 'Admin access required',
        message: 'You need administrator privileges'
      })
    }

    request.user.role = userRole

  } catch (error) {
    request.log.error('Error checking admin role', { error: error.message, userId: request.user.id })
    return reply.code(500).send({
      error: 'Permission check failed',
      message: error.message
    })
  }
}