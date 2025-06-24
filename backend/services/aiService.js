import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor(logger) {
    this.logger = logger
    this.geminiApiKey = process.env.GEMINI_API_KEY
    this.edamamFoodAppId = process.env.EDAMAM_APP_FOOD_ID
    this.edamamFoodAppKey = process.env.EDAMAM_APP_FOOD_KEY
    
    // Ініціалізація Gemini AI
    if (this.geminiApiKey) {
      this.gemini = new GoogleGenerativeAI(this.geminiApiKey);
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
      if (!this.geminiApiKey) {
        this.logger.error('Gemini API key missing')
        return this.getFallbackSuggestion(ingredients, preferences)
      }

      this.logger.info('Getting recipe suggestions with Gemini', { 
        ingredientsCount: ingredients.length,
        hasPreferences: !!preferences
      })

      const systemPrompt = `Ти корисний кулінарний помічник, який пропонує рецепти на основі доступних інгредієнтів. 
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

      const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' })
      const prompt = `${systemPrompt}\n\nКористувач: ${userMessage}`
      
      const result = await model.generateContent(prompt)
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
      // вивиде помилку в чому саме проблема
      this.logger.error('Error getting recipe suggestions from Gemini', { 
        error: error.message,
        stack: error.stack,
        name: error.name,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data || error.response,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
    }
  }
}

export default AIService;