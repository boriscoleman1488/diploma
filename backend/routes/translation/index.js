import { authenticateUser } from '../../middleware/auth.js';

export default async function translationRoutes(fastify, options) {
  // Test translation endpoint
  fastify.post('/translate', {
    schema: {
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', minLength: 1 },
          sourceLanguage: { type: 'string', enum: ['uk', 'en', 'auto'], default: 'auto' },
          targetLanguage: { type: 'string', enum: ['uk', 'en'], default: 'en' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { text, sourceLanguage = 'auto', targetLanguage = 'en' } = request.body;

      if (!fastify.translationService || !fastify.translationService.isConfigured) {
        return reply.code(503).send({
          success: false,
          error: 'Translation service not configured',
          message: 'Сервіс перекладу не налаштовано. Перевірте DEEPL_API_KEY в .env файлі'
        });
      }

      let detectedLanguage = sourceLanguage;
      if (sourceLanguage === 'auto') {
        detectedLanguage = await fastify.translationService.detectLanguage(text);
      }

      let translatedText;
      if (targetLanguage === 'en') {
        translatedText = await fastify.translationService.translateToEnglish(text, detectedLanguage);
      } else {
        translatedText = await fastify.translationService.translateToUkrainian(text, detectedLanguage);
      }

      return {
        success: true,
        originalText: text,
        translatedText,
        detectedLanguage,
        targetLanguage
      };
    } catch (error) {
      fastify.log.error('Translation error', { error: error.message });
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Помилка перекладу'
      });
    }
  });

  // Get translation service status
  fastify.get('/status', async (request, reply) => {
    try {
      const isConfigured = fastify.translationService?.isConfigured || false;
      const isWorking = fastify.translationService?.isApiWorking || false;

      return {
        success: true,
        status: {
          isConfigured,
          isWorking,
          provider: 'DeepL',
          staticDictionarySize: Object.keys(fastify.translationService?.staticDictionary || {}).length
        }
      };
    } catch (error) {
      fastify.log.error('Translation status error', { error: error.message });
      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Помилка отримання статусу перекладача'
      });
    }
  });
}