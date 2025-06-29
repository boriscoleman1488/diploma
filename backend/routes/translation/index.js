import { authenticateUser } from '../../middleware/auth.js'

export default async function translationRoutes(fastify, options) {
  // Test translation endpoint
  fastify.get('/test', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          text: { type: 'string', minLength: 1 },
          targetLang: { type: 'string', enum: ['en', 'uk'], default: 'en' }
        },
        required: ['text']
      }
    }
  }, async (request, reply) => {
    try {
      const { text, targetLang = 'en' } = request.query

      if (!fastify.translationService || !fastify.translationService.isConfigured) {
        return reply.code(503).send({
          success: false,
          error: 'Translation service not available',
          message: 'Сервіс перекладу тимчасово недоступний'
        })
      }

      // Detect language first
      const detectedLanguage = await fastify.translationService.detectLanguage(text)
      console.log(`Detected language for "${text}": ${detectedLanguage}`)

      let translatedText
      if (targetLang === 'en') {
        translatedText = await fastify.translationService.translateToEnglish(text, detectedLanguage)
      } else {
        translatedText = await fastify.translationService.translateToUkrainian(text, detectedLanguage)
      }

      return {
        success: true,
        originalText: text,
        detectedLanguage,
        targetLanguage: targetLang,
        translatedText,
        isApiWorking: fastify.translationService.isApiWorking
      }
    } catch (error) {
      fastify.log.error('Translation test error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: `Помилка перекладу: ${error.message}`
      })
    }
  })

  // Translate text endpoint
  fastify.post('/translate', {
    preHandler: [authenticateUser],
    schema: {
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', minLength: 1 },
          targetLanguage: { type: 'string', enum: ['en', 'uk'], default: 'en' },
          sourceLanguage: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { text, targetLanguage = 'en', sourceLanguage } = request.body

      if (!fastify.translationService || !fastify.translationService.isConfigured) {
        return reply.code(503).send({
          success: false,
          error: 'Translation service not available',
          message: 'Сервіс перекладу тимчасово недоступний'
        })
      }

      // Detect language if not provided
      let detectedLanguage = sourceLanguage
      if (!detectedLanguage) {
        detectedLanguage = await fastify.translationService.detectLanguage(text)
      }

      // Skip translation if source and target languages are the same
      if (detectedLanguage === targetLanguage) {
        return {
          success: true,
          originalText: text,
          translatedText: text,
          detectedLanguage,
          targetLanguage,
          message: 'No translation needed - source and target languages are the same'
        }
      }

      let translatedText
      if (targetLanguage === 'en') {
        translatedText = await fastify.translationService.translateToEnglish(text, detectedLanguage)
      } else {
        translatedText = await fastify.translationService.translateToUkrainian(text, detectedLanguage)
      }

      return {
        success: true,
        originalText: text,
        translatedText,
        detectedLanguage,
        targetLanguage
      }
    } catch (error) {
      fastify.log.error('Translation error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: `Помилка перекладу: ${error.message}`
      })
    }
  })

  // Get translation service status
  fastify.get('/status', {
    preHandler: [authenticateUser]
  }, async (request, reply) => {
    try {
      const isConfigured = fastify.translationService && fastify.translationService.isConfigured
      const isWorking = fastify.translationService && fastify.translationService.isApiWorking

      return {
        success: true,
        status: {
          isConfigured,
          isWorking,
          apiKey: isConfigured ? 'configured' : 'missing',
          staticDictionarySize: fastify.translationService ? 
            Object.keys(fastify.translationService.staticDictionary).length : 0
        }
      }
    } catch (error) {
      fastify.log.error('Translation status error', { error: error.message })
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Помилка отримання статусу перекладу'
      })
    }
  })
}