export const authenticateUser = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Access token required',
        message: 'Будь ласка, увійдіть в систему'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error } = await request.server.supabase.auth.getUser(token)

    if (error || !user) {
      request.log.error('Authentication failed', { error: error?.message })
      return reply.code(401).send({
        error: 'Invalid token',
        message: 'Будь ласка, увійдіть в систему знову'
      })
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await request.server.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      request.log.error('Profile not found', { error: profileError?.message, userId: user.id })
      return reply.code(401).send({
        error: 'Profile not found',
        message: 'Профіль користувача не знайдено'
      })
    }

    request.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: profile.role || 'user',
      emailConfirmed: user.email_confirmed_at !== null,
      lastSignIn: user.last_sign_in_at,
      metadata: user.user_metadata,
      profile: profile
    }

    request.log.info('User authenticated', {
      userId: request.user.id,
      email: request.user.email,
      role: request.user.role
    })

  } catch (error) {
    request.log.error('Authentication error', { error: error.message })
    return reply.code(401).send({
      error: 'Authentication failed',
      message: 'Не вдалося перевірити токен'
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
          message: 'Ви вже увійшли в систему. Будь ласка, вийдіть спочатку.',
          redirectTo: '/profile'
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
        message: 'Будь ласка, увійдіть в систему спочатку'
      })
    }

    const userRole = request.user.role

    if (userRole !== requiredRole) {
      return reply.code(403).send({
        error: 'Insufficient permissions',
        message: `Потрібна роль: ${requiredRole}, ваша роль: ${userRole || 'none'}`
      })
    }
  }
}

export const requireAdmin = async (request, reply) => {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Authentication required',
      message: 'Будь ласка, увійдіть в систему спочатку'
    })
  }

  const userRole = request.user.role
  const isAdmin = userRole === 'admin'

  if (!isAdmin) {
    return reply.code(403).send({
      error: 'Admin access required',
      message: 'Потрібні права адміністратора'
    })
  }
}