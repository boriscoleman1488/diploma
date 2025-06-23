import Fastify from 'fastify'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyMultipart from '@fastify/multipart'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

import { EdamamService } from './services/edamamService.js'
import { AuthService } from './services/authService.js'
import { CategoryService } from './services/categoryService.js'
import { UserService } from './services/userService.js'
import { DishService } from './services/dishService.js'
import { CommentService } from './services/commentService.js'
import { RatingService } from './services/ratingService.js'
import { CollectionService } from './services/collectionService.js'
import { EmailService } from './services/emailService.js'

import authRoutes from './routes/auth.js'

import userRoutes from './routes/users/index.js'
import userAdminRoutes from './routes/users/admin.js'
import categoryRoutes from './routes/categories/index.js'
import categoryAdminRoutes from './routes/categories/admin.js'
import dishRoutes from './routes/dishes/index.js'
import dishAdminRoutes from './routes/dishes/admin.js'
import commentRoutes from './routes/comments/index.js'
import commentAdminRoutes from './routes/comments/admin.js'
import ratingRoutes from './routes/ratings/index.js'
import ratingAdminRoutes from './routes/ratings/admin.js'
import collectionRoutes from './routes/collections/index.js'
import collectionAdminRoutes from './routes/collections/admin.js'

// Додайте це в початок файлу
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Не завершуйте процес для production
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

dotenv.config()

// Simple logger configuration without deprecated features
const fastify = Fastify({
  logger: process.env.NODE_ENV === 'production' 
    ? {
        level: 'info'
      }
    : {
        level: process.env.LOG_LEVEL || 'info'
      }
})

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
  port: process.env.PORT || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:5173'
}

if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseJwtSecret) {
  fastify.log.error('Missing required Supabase configuration')
  process.exit(1)
}

await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: false
})

await fastify.register(fastifyCors, {
  origin: config.allowedOrigins.split(',') || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
})

// Додайте хук для логування CORS запитів
fastify.addHook('onRequest', async (request, reply) => {
  if (request.method === 'OPTIONS') {
    fastify.log.info(`CORS preflight request: ${request.method} ${request.url} from ${request.headers.origin}`)
  }
})

await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

// Register multipart support for file uploads
await fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file at a time
  }
})

const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey)
const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey)

fastify.decorate('supabase', supabaseClient)
fastify.decorate('supabaseAdmin', supabaseAdmin)
fastify.decorate('supabaseJwtSecret', config.supabaseJwtSecret)

const emailService = new EmailService(fastify.log)
const authService = new AuthService(supabaseClient, fastify.log, emailService)
const categoryService = new CategoryService(supabaseClient, fastify.log)
const userService = new UserService(supabaseClient, fastify.log, emailService)
const dishService = new DishService(supabaseClient, fastify.log)
const commentService = new CommentService(supabaseClient, fastify.log)
const ratingService = new RatingService(supabaseClient, fastify.log)
const collectionService = new CollectionService(supabaseClient, fastify.log)
const edamamService = new EdamamService(
  process.env.EDAMAM_APP_ID,
  process.env.EDAMAM_APP_KEY
)

fastify.decorate('emailService', emailService)
fastify.decorate('authService', authService)
fastify.decorate('categoryService', categoryService)
fastify.decorate('userService', userService)
fastify.decorate('dishService', dishService)
fastify.decorate('edamam', edamamService)
fastify.decorate('commentService', commentService)
fastify.decorate('ratingService', ratingService)
fastify.decorate('collectionService', collectionService)

await fastify.register(authRoutes, { prefix: '/api/auth' })

// User routes
await fastify.register(userRoutes, { prefix: '/api/users' })
await fastify.register(categoryRoutes, { prefix: '/api/categories' })
await fastify.register(dishRoutes, { prefix: '/api/dishes' })
await fastify.register(commentRoutes, { prefix: '/api/comments' })
await fastify.register(ratingRoutes, { prefix: '/api/ratings' })
await fastify.register(collectionRoutes, { prefix: '/api/collections' })

// Admin routes
await fastify.register(userAdminRoutes, { prefix: '/api/admin/users' })
await fastify.register(categoryAdminRoutes, { prefix: '/api/admin/categories' })
await fastify.register(dishAdminRoutes, { prefix: '/api/admin/dishes' })
await fastify.register(commentAdminRoutes, { prefix: '/api/admin/comments' })
await fastify.register(ratingAdminRoutes, { prefix: '/api/admin/ratings' })
await fastify.register(collectionAdminRoutes, { prefix: '/api/admin/collections' })

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'Recipe API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      dishes: '/api/dishes',
      users: '/api/users',
      admin: '/api/admin',
      comments: '/api/comments',
      ratings: '/api/ratings',
      collections: '/api/collections'
    }
  }
})

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      storage: 'unknown'
    }
  }

  try {
    // Перевіряємо підключення до бази даних
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(1)
    
    health.services.database = error ? 'unhealthy' : 'healthy'
  } catch (error) {
    health.services.database = 'unhealthy'
  }

  try {
    // Перевіряємо підключення до Supabase Storage
    const { data: buckets, error } = await supabaseClient.storage.listBuckets()
    health.services.storage = error ? 'unhealthy' : 'healthy'
  } catch (error) {
    health.services.storage = 'unhealthy'
  }

  const isHealthy = Object.values(health.services).every(status => status === 'healthy')
  health.status = isHealthy ? 'healthy' : 'degraded'

  return health
})

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    message: `Route ${request.method} ${request.url} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/categories',
      'POST /api/categories',
      'GET /api/dishes',
      'POST /api/dishes',
      'GET /api/users/profile',
      'GET /api/admin/users',
      'POST /api/comments/:dishId',
      'GET /api/comments/:dishId',
      'GET /api/ratings/:dishId',
      'GET /api/collections'
    ]
  })
})

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0'
    })
    console.log(`🚀 Сервер запущено на http://localhost:${config.port}`)
    
    // Тестуємо Supabase Storage при запуску
    try {
      const { data: buckets, error } = await supabaseClient.storage.listBuckets()
      if (!error && buckets) {
        console.log('✅ Supabase Storage підключено успішно')
        const avatarBucket = buckets.find(bucket => bucket.id === 'avatars')
        if (avatarBucket) {
          console.log('✅ Bucket "avatars" знайдено')
        } else {
          console.log('⚠️ Bucket "avatars" не знайдено')
        }
      } else {
        console.log('⚠️ Supabase Storage недоступно:', error?.message)
      }
    } catch (storageError) {
      console.log('⚠️ Помилка підключення до Supabase Storage:', storageError.message)
    }
  } catch (err) {
    console.error('Помилка запуску сервера:', err)
    process.exit(1)
  }
}

start()