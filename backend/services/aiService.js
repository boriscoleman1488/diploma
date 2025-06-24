import { GoogleGenerativeAI } from '@google/generative-ai'

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

  // Функція перевірки валідності Gemini API ключа
  async validateGeminiApiKey() {
    try {
      if (!this.geminiApiKey) {
        return {
          success: false,
          error: 'GEMINI_API_KEY відсутній в .env файлі'
        }
      }

      // Тестовий запит до Gemini API
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test'
            }]
          }]
        })
      })

      if (response.ok) {
        this.logger.info('Gemini API key is valid')
        return {
          success: true,
          message: 'Gemini API ключ валідний'
        }
      } else {
        const errorData = await response.json()
        this.logger.error('Gemini API key validation failed', { 
          status: response.status,
          error: errorData 
        })
        
        let errorMessage = 'Невалідний Gemini API ключ'
        if (response.status === 400) {
          errorMessage = 'Невірний формат API ключа'
        } else if (response.status === 403) {
          errorMessage = 'API ключ заблокований або немає доступу'
        } else if (response.status === 429) {
          errorMessage = 'Перевищено ліміт запитів'
        }
        
        return {
          success: false,
          error: errorMessage,
          details: errorData
        }
      }
    } catch (error) {
      this.logger.error('Error validating Gemini API key', { 
        error: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: 'Помилка при перевірці API ключа',
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
      if (!this.geminiApiKey) {
        this.logger.error('Gemini API key missing')
        return {
          success: false,
          error: 'AI чат тимчасово не працює. Спробуйте пізніше.'
        }
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

      // Використовуємо новий API відповідно до документації
      const response = await this.gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\n\nКористувач: ${userMessage}`
      })
      
      const suggestion = response.text

      this.logger.info('Gemini recipe suggestion generated successfully', { 
        responseLength: suggestion.length 
      })

      return {
        success: true,
        suggestion
      }
    } catch (error) {
      // детальне логування помилки
      this.logger.error('Error getting recipe suggestions from Gemini', { 
        error: error.message,
        stack: error.stack,
        name: error.name,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data || error.response,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
      
      // повертаємо просту помилку
      return {
        success: false,
        error: 'AI чат тимчасово не працює. Спробуйте пізніше.'
      }
    }
  }

  getFallbackSuggestion(ingredients, preferences = '') {
    const fallbackRecipes = [
      {
        title: "🍳 Простий омлет",
        description: "Швидкий та поживний сніданок з доступних інгредієнтів",
        time: "10 хвилин",
        difficulty: "Легко"
      },
      {
        title: "🥗 Свіжий салат",
        description: "Здоровий салат з наявних овочів та зелені",
        time: "5 хвилин",
        difficulty: "Дуже легко"
      },
      {
        title: "🍝 Паста з простим соусом",
        description: "Класична паста з базовими інгредієнтами",
        time: "15 хвилин",
        difficulty: "Легко"
      }
    ]

    const randomRecipe = fallbackRecipes[Math.floor(Math.random() * fallbackRecipes.length)]
    
    const suggestion = `# ${randomRecipe.title}

${randomRecipe.description}

**Час приготування:** ${randomRecipe.time}  
**Рівень складності:** ${randomRecipe.difficulty}

## Інгредієнти:
${ingredients.map(ing => `- ${ing}`).join('\n')}

## Інструкції:
1. Підготуйте всі інгредієнти
2. Слідуйте базовому рецепту для обраної страви
3. Адаптуйте під свої смаки

*Примітка: AI сервіс тимчасово недоступний. Це базова рекомендація на основі ваших інгредієнтів.*`

    return {
      success: true,
      suggestion
    }
  }
}

export default AIService;