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
import AIService from './services/aiService.js'
import { TranslationService } from './services/translationService.js'

import authRoutes from './routes/auth.js'
import edamamRoutes from './routes/edamam/index.js'
import aiRoutes from './routes/ai/index.js'
import aiChatRoutes from './routes/ai/chat.js'
import aiAdminRoutes from './routes/ai/admin.js'
import translationRoutes from './routes/translation/index.js'

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

dotenv.config()

console.log('Environment variables check:', {
  EDAMAM_APP_FOOD_ID: process.env.EDAMAM_APP_FOOD_ID ? `${process.env.EDAMAM_APP_FOOD_ID.substring(0, 4)}...` : 'missing',
  EDAMAM_APP_FOOD_KEY: process.env.EDAMAM_APP_FOOD_KEY ? `${process.env.EDAMAM_APP_FOOD_KEY.substring(0, 4)}...` : 'missing',
  EDAMAM_APP_NUTRITION_ID: process.env.EDAMAM_APP_NUTRITION_ID ? `${process.env.EDAMAM_APP_NUTRITION_ID.substring(0, 4)}...` : 'missing',
  EDAMAM_APP_NUTRITION_KEY: process.env.EDAMAM_APP_NUTRITION_KEY ? `${process.env.EDAMAM_APP_NUTRITION_KEY.substring(0, 4)}...` : 'missing',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
  DEEPL_API_KEY: process.env.DEEPL_API_KEY ? 'configured' : 'missing'
})

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

fastify.addHook('onRequest', async (request, reply) => {
  if (request.method === 'OPTIONS') {
    fastify.log.info(`CORS preflight request: ${request.method} ${request.url} from ${request.headers.origin}`)
  }
})

await fastify.register(fastifyRateLimit, {
  max: 1000,
  timeWindow: '1 minute'
})

await fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
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
const collectionService = new CollectionService(supabaseClient, fastify.log)
const dishService = new DishService(supabaseClient, fastify.log, collectionService, supabaseAdmin)
const commentService = new CommentService(supabaseClient, fastify.log)
const ratingService = new RatingService(supabaseClient, fastify.log)

const translationService = new TranslationService({
  apiKey: process.env.DEEPL_API_KEY
})

const edamamService = new EdamamService({
  foodAppId: process.env.EDAMAM_APP_FOOD_ID,
  foodAppKey: process.env.EDAMAM_APP_FOOD_KEY,
  nutritionAppId: process.env.EDAMAM_APP_NUTRITION_ID,
  nutritionAppKey: process.env.EDAMAM_APP_NUTRITION_KEY,
  translationService: translationService
})

const aiService = new AIService(fastify.log)

fastify.decorate('emailService', emailService)
fastify.decorate('authService', authService)
fastify.decorate('categoryService', categoryService)
fastify.decorate('userService', userService)
fastify.decorate('translationService', translationService)
fastify.decorate('dishService', dishService)
fastify.decorate('edamam', edamamService)
fastify.decorate('commentService', commentService)
fastify.decorate('ratingService', ratingService)
fastify.decorate('collectionService', collectionService)
fastify.decorate('aiService', aiService)

await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(edamamRoutes, { prefix: '/api/edamam' })
await fastify.register(aiRoutes, { prefix: '/api/ai' })
await fastify.register(aiChatRoutes, { prefix: '/api/ai/chat' })
await fastify.register(aiAdminRoutes, { prefix: '/api/admin/ai' })
await fastify.register(translationRoutes, { prefix: '/api/translation' })

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
      collections: '/api/collections',
      edamam: '/api/edamam',
      ai: '/api/ai',
      translation: '/api/translation'
    }
  }
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
      'GET /api/collections',
      'GET /api/edamam/search',
      'POST /api/edamam/analyze-nutrition',
      'POST /api/ai/search-ingredients',
      'POST /api/ai/recipe-suggestions',
      'POST /api/translation/translate'
    ]
  })
})

async function ensureAvatarsBucket() {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.log('⚠️ Не вдалося перевірити buckets:', listError.message)
      return false
    }

    const avatarBucket = buckets.find(bucket => bucket.id === 'avatars')
    
    if (!avatarBucket) {
      console.log('📦 Створюємо bucket "avatars"...')
      
      const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })
      
      if (createError) {
        console.log('❌ Помилка створення bucket "avatars":', createError.message)
        return false
      }
      
      console.log('✅ Bucket "avatars" створено успішно')
      return true
    } else {
      console.log('✅ Bucket "avatars" вже існує')
      return true
    }
  } catch (error) {
    console.log('❌ Помилка при роботі з bucket:', error.message)
    return false
  }
}

async function ensureDishImagesBucket() {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.log('⚠️ Не вдалося перевірити buckets:', listError.message)
      return false
    }

    const dishImagesBucket = buckets.find(bucket => bucket.id === 'dish-images')
    
    if (!dishImagesBucket) {
      console.log('📦 Створюємо bucket "dish-images"...')
      
      const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('dish-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })
      
      if (createError) {
        console.log('❌ Помилка створення bucket "dish-images":', createError.message)
        return false
      }
      
      console.log('✅ Bucket "dish-images" створено успішно')
      return true
    } else {
      console.log('✅ Bucket "dish-images" вже існує')
      return true
    }
  } catch (error) {
    console.log('❌ Помилка при роботі з bucket:', error.message)
    return false
  }
}

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '127.0.0.1' // Changed from 0.0.0.0 to 127.0.0.1 for better localhost connectivity
    })
    console.log(`🚀 Сервер запущено на http://localhost:${config.port}`)
    
    try {
      const { data: buckets, error } = await supabaseClient.storage.listBuckets()
      if (!error && buckets) {
        console.log('✅ Supabase Storage підключено успішно')
        
        await ensureAvatarsBucket()
        
        await ensureDishImagesBucket()
      } else {
        console.log('⚠️ Supabase Storage недоступно:', error?.message)
      }
    } catch (storageError) {
      console.log('⚠️ Помилка підключення до Supabase Storage:', storageError.message)
    }

    if (process.env.EDAMAM_APP_FOOD_ID && process.env.EDAMAM_APP_FOOD_KEY) {
      console.log('✅ Edamam Food Database API налаштовано')
    } else {
      console.log('⚠️ Edamam Food Database API не налаштовано. Додайте EDAMAM_APP_FOOD_ID та EDAMAM_APP_FOOD_KEY до .env файлу')
    }

    if (process.env.EDAMAM_APP_NUTRITION_ID && process.env.EDAMAM_APP_NUTRITION_KEY) {
      console.log('✅ Edamam Nutrition Analysis API налаштовано')
    } else {
      console.log('⚠️ Edamam Nutrition Analysis API не налаштовано. Додайте EDAMAM_APP_NUTRITION_ID та EDAMAM_APP_NUTRITION_KEY до .env файлу')
    }

    if (process.env.GEMINI_API_KEY) {
      console.log('✅ Gemini API налаштовано')
    } else {
      console.log('⚠️ Gemini API не налаштовано. Додайте GEMINI_API_KEY до .env файлу')
    }
    
    if (process.env.DEEPL_API_KEY) {
      console.log('✅ DeepL API налаштовано')
    } else {
      console.log('⚠️ DeepL API не налаштовано. Додайте DEEPL_API_KEY до .env файлу')
    }
  } catch (err) {
    console.error('Помилка запуску сервера:', err)
    process.exit(1)
  }
}

start()