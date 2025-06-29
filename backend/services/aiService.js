import { GoogleGenerativeAI } from '@google/generative-ai'

export class AIService {
  constructor(logger) {
    this.logger = logger
    this.geminiApiKey = process.env.GEMINI_API_KEY
    this.edamamFoodAppId = process.env.EDAMAM_APP_FOOD_ID
    this.edamamFoodAppKey = process.env.EDAMAM_APP_FOOD_KEY

    if (this.geminiApiKey) {
      try {
        this.gemini = new GoogleGenerativeAI(this.geminiApiKey)
        this.logger.info('Gemini AI initialized successfully')
      } catch (error) {
        this.logger.error('Failed to initialize Gemini AI', {
          error: error.message,
          stack: error.stack
        })
      }
    } else {
      this.logger.warn('GEMINI_API_KEY not provided in environment variables')
    }
  }

  // Function to validate Gemini API key
  async validateGeminiApiKey() {
    try {
      if (!this.geminiApiKey) {
        return {
          success: false,
          error: 'GEMINI_API_KEY відсутній в .env файлі'
        }
      }

      // Test request to Gemini API using the new method
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent('Test')
      const response = await result.response

      if (response.text()) {
        this.logger.info('Gemini API key is valid')
        return {
          success: true,
          message: 'Gemini API ключ валідний'
        }
      } else {
        return {
          success: false,
          error: 'Невалідний Gemini API ключ'
        }
      }
    } catch (error) {
      this.logger.error('Error validating Gemini API key', {
        error: error.message,
        stack: error.stack
      })

      let errorMessage = 'Помилка при перевірці API ключа'
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'Невірний формат API ключа'
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'API ключ заблокований або немає доступу'
      } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = 'Перевищено ліміт запитів'
      }

      return {
        success: false,
        error: errorMessage,
        details: error.message
      }
    }
  }

  async searchIngredients(query, limit = 5) {
    try {
      if (!this.edamamFoodAppId || !this.edamamFoodAppKey) {
        this.logger.error('Edamam API credentials missing')
        return {
          success: false,
          error: 'Edamam API credentials missing'
        }
      }

      const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${this.edamamFoodAppId}&app_key=${this.edamamFoodAppKey}&ingr=${encodeURIComponent(query)}&limit=${limit}`

      this.logger.info('Searching ingredients with Edamam API', { query, limit })
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        this.logger.error('Edamam API error', { status: response.status, message: data.message })
        throw new Error(`Edamam API error: ${data.message || 'Unknown error'}`)
      }

      // Get the translation service from the request
      const translationService = process.env.DEEPL_API_KEY ? 
        { translateToUkrainian: async (text) => {
          try {
            // Use DeepL API directly here
            const deeplUrl = 'https://api-free.deepl.com/v2/translate';
            const deeplResponse = await fetch(deeplUrl, {
              method: 'POST',
              headers: {
                'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: [text],
                target_lang: 'UK',
                source_lang: 'EN'
              })
            });
            
            if (!deeplResponse.ok) {
              throw new Error(`DeepL API error: ${deeplResponse.statusText}`);
            }
            
            const deeplData = await deeplResponse.json();
            return deeplData.translations[0].text;
          } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text if translation fails
          }
        }} : null;

      // Process and translate the foods
      const foods = [];
      
      if (data.parsed && data.parsed.length > 0) {
        for (const item of data.parsed) {
          const food = item.food;
          
          // Translate the food label to Ukrainian
          let ukrainianLabel = food.label;
          if (translationService) {
            try {
              ukrainianLabel = await translationService.translateToUkrainian(food.label);
              this.logger.info(`Translated food label: "${food.label}" -> "${ukrainianLabel}"`);
            } catch (error) {
              this.logger.error('Failed to translate food label:', error);
            }
          }
          
          foods.push({
            foodId: food.foodId,
            label: ukrainianLabel, // Ukrainian label for display
            originalLabel: food.label, // Keep original English label
            category: food.category,
            image: food.image,
            nutrients: food.nutrients
          });
        }
      }

      this.logger.info('Ingredients search successful', { count: foods.length })
      return {
        success: true,
        foods
      }
    } catch (error) {
      this.logger.error('Error searching ingredients', { error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getRecipeSuggestions(ingredients, preferences = '') {
    try {
      if (!this.geminiApiKey || !this.gemini) {
        this.logger.error('Gemini API key missing or initialization failed')
        return {
          success: false,
          error: 'AI чат тимчасово не працює. Перевірте налаштування GEMINI_API_KEY в .env файлі.'
        }
      }

      this.logger.info('Getting recipe suggestions with Gemini', {
        ingredientsCount: ingredients.length,
        hasPreferences: !!preferences
      })

      // System instruction according to the new documentation
      const systemInstruction = `Ти корисний кулінарний помічник, який пропонує страву на основі доступних інгредієнтів. 
                                Зосередься на практичних, легких для виконання стравах, які використовують надані інгредієнти.
                                Форматуй свою відповідь у markdown з чіткими розділами:
                                1. Назва страви (як заголовок)
                                2. Короткий опис
                                3. Список інгредієнтів (з кількістю)
                                4. Покрокові інструкції
                                5. Час приготування та рівень складності

                                Якщо у користувача є дієтичні переваги або обмеження, адаптуй свої пропозиції відповідно.
                                Якщо список інгредієнтів дуже обмежений, запропонуй прості страви або порекомендуй кілька додаткових інгредієнтів.`

      const userMessage = `У мене є ці інгредієнти: ${ingredients.join(', ')}. ${preferences ? `Мої переваги: ${preferences}.` : ''} Що я можу приготувати?`

      const model = this.gemini.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction
      })

      const result = await model.generateContent(userMessage)
      const response = await result.response
      const suggestion = response.text()

      this.logger.info('Gemini recipe suggestion generated successfully', {
        responseLength: suggestion.length
      })

      return {
        success: true,
        suggestion
      }
    } catch (error) {
      // Detailed error logging
      this.logger.error('Error getting recipe suggestions from Gemini', {
        error: error.message,
        stack: error.stack,
        name: error.name,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data || error.response,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })

      // Return a user-friendly error message
      return {
        success: false,
        error: 'AI чат тимчасово не працює. Спробуйте пізніше.'
      }
    }
  }
}

export default AIService