import { GoogleGenerativeAI } from '@google/generative-ai'

export class AIService {
  constructor(logger) {
    this.logger = logger
    this.geminiApiKey = process.env.GEMINI_API_KEY
    this.edamamFoodAppId = process.env.EDAMAM_APP_FOOD_ID
    this.edamamFoodAppKey = process.env.EDAMAM_APP_FOOD_KEY
    
    // Initialize Gemini AI according to the new documentation
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
      
      const foods = data.parsed?.map(item => ({
        foodId: item.food.foodId,
        label: item.food.label,
        category: item.food.category,
        image: item.food.image,
        nutrients: item.food.nutrients
      })) || []

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
      const systemInstruction = `Ти корисний кулінарний помічник, який пропонує рецепти на основі доступних інгредієнтів. 
Зосередься на практичних, легких для виконання рецептах, які використовують надані інгредієнти.
Форматуй свою відповідь у markdown з чіткими розділами:
1. Назва рецепту (як заголовок)
2. Короткий опис
3. Список інгредієнтів (з кількістю)
4. Покрокові інструкції
5. Час приготування та рівень складності

Якщо у користувача є дієтичні переваги або обмеження, адаптуй свої пропозиції відповідно.
Якщо список інгредієнтів дуже обмежений, запропонуй прості рецепти або порекомендуй кілька додаткових інгредієнтів.`

      const userMessage = `У мене є ці інгредієнти: ${ingredients.join(', ')}. ${preferences ? `Мої переваги: ${preferences}.` : ''} Що я можу приготувати?`

      // Using the new API according to documentation
      const model = this.gemini.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
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

  getFallbackSuggestion(ingredients, preferences = '') {
    this.logger.info('Using fallback suggestion due to missing Gemini API key')
    
    return {
      success: false,
      error: 'AI чат тимчасово не працює. Спробуйте пізніше.'
    }
  }
}

export default AIService