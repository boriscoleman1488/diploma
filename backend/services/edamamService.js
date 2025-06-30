export class EdamamService {
  constructor(config) {
    // Food Database API credentials
    this.foodAppId = config.foodAppId
    this.foodAppKey = config.foodAppKey
    
    // Nutrition Analysis API credentials
    this.nutritionAppId = config.nutritionAppId
    this.nutritionAppKey = config.nutritionAppKey
    
    // API URLs
    this.foodDatabaseUrl = 'https://api.edamam.com/api/food-database/v2'
    this.nutritionAnalysisUrl = 'https://api.edamam.com/api/nutrition-details'
    
    // Check if APIs are configured
    this.isFoodApiConfigured = !!(this.foodAppId && this.foodAppKey)
    this.isNutritionApiConfigured = !!(this.nutritionAppId && this.nutritionAppKey)
    
    // Log configuration status for debugging
    console.log('EdamamService configuration:', {
      foodApiConfigured: this.isFoodApiConfigured,
      nutritionApiConfigured: this.isNutritionApiConfigured,
      foodAppId: this.foodAppId ? `${this.foodAppId.substring(0, 4)}...` : 'missing',
      nutritionAppId: this.nutritionAppId ? `${this.nutritionAppId.substring(0, 4)}...` : 'missing'
    })
    
    // Add translation service
    this.translationService = config.translationService
    
    // Maximum number of ingredients for analysis
    this.MAX_INGREDIENTS = 20
  }

  // Food Database API methods
  async searchFood(query, limit = 20) {
    if (!this.isFoodApiConfigured) {
      return {
        success: false,
        error: 'Edamam Food Database API не налаштовано. Додайте EDAMAM_APP_FOOD_ID та EDAMAM_APP_FOOD_KEY до .env файлу'
      }
    }

    try {
      // Try to translate query to English for Edamam API
      let translatedQuery = query;
      let originalQuery = query;
      
      if (this.translationService && this.translationService.isConfigured) {
        try {
          // Detect query language
          const detectedLanguage = await this.translationService.detectLanguage(query);
          
          // If not English, translate
          if (detectedLanguage !== 'en') {
            translatedQuery = await this.translationService.translateToEnglish(query, detectedLanguage);
            console.log(`Translated query: "${query}" -> "${translatedQuery}"`);
          }
        } catch (translationError) {
          console.error('Translation error during search:', translationError);
          // Continue with original query if translation fails
        }
      }
      
      // If query is too short, return error
      if (translatedQuery.length < 2) {
        return {
          success: false,
          error: 'Запит занадто короткий. Введіть принаймні 2 символи.'
        }
      }
      
      const url = `${this.foodDatabaseUrl}/parser?app_id=${this.foodAppId}&app_key=${this.foodAppKey}&ingr=${encodeURIComponent(translatedQuery)}&limit=${limit}`
      
      console.log(`Making request to Edamam API: ${url}`);
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Edamam API error:', data);
        throw new Error(data.message || 'Edamam API error')
      }
      
      const foods = []
      
      // Process results
      if (data.parsed && data.parsed.length > 0) {
        for (const item of data.parsed) {
          const food = item.food
          
          // Try to translate label back to Ukrainian for display
          let displayLabel = food.label
          if (this.translationService && this.translationService.isConfigured) {
            try {
              displayLabel = await this.translationService.translateToUkrainian(food.label)
              console.log(`Translated food label: "${food.label}" -> "${displayLabel}"`)
            } catch (error) {
              console.error('Failed to translate label back to Ukrainian:', error)
            }
          }
          
          foods.push({
            foodId: food.foodId,
            label: displayLabel, // Ukrainian name for display
            originalLabel: food.label, // English name for saving
            category: food.category,
            image: food.image,
            nutrients: food.nutrients
          })
        }
      }
      
      // If no parsed results, try hints
      if (foods.length === 0 && data.hints && data.hints.length > 0) {
        for (const hint of data.hints.slice(0, limit)) {
          const food = hint.food
          
          // Try to translate label back to Ukrainian for display
          let displayLabel = food.label
          if (this.translationService && this.translationService.isConfigured) {
            try {
              displayLabel = await this.translationService.translateToUkrainian(food.label)
            } catch (error) {
              console.error('Failed to translate hint label to Ukrainian:', error)
            }
          }
          
          foods.push({
            foodId: food.foodId,
            label: displayLabel,
            originalLabel: food.label,
            category: food.category,
            image: food.image,
            nutrients: food.nutrients
          })
        }
      }
      
      if (foods.length === 0) {
        return {
          success: false,
          error: 'Інгредієнти не знайдено. Спробуйте використати англійську назву (наприклад: "tomato" замість "помідор").'
        }
      }
      
      return {
        success: true,
        foods: foods,
        query: translatedQuery,
        originalQuery: originalQuery
      }
    } catch (error) {
      console.error('Edamam search error:', error)
      return {
        success: false,
        error: error.message || 'Помилка пошуку інгредієнтів'
      }
    }
  }

  async getFoodDetails(foodId) {
    if (!this.isFoodApiConfigured) {
      return {
        success: false,
        error: 'Edamam Food Database API не налаштовано'
      }
    }

    try {
      const url = `${this.foodDatabaseUrl}/nutrients?app_id=${this.foodAppId}&app_key=${this.foodAppKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: [{
            quantity: 100,
            measureURI: 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
            foodId: foodId
          }]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Неправильні credentials для Edamam Food Database API')
        }
        throw new Error(`Edamam Food Database API error: ${data.message || 'Unknown error'}`)
      }

      return {
        success: true,
        nutrients: data.totalNutrients,
        calories: data.calories,
        weight: data.totalWeight
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Helper function to normalize ingredient names to English
  async normalizeIngredientName(name) {
    // First try static dictionary for speed
    
    const lowerName = name.toLowerCase().trim()
    
    // Check static dictionary
    if (this.translationService && this.translationService.staticDictionary[lowerName]) {
      return this.translationService.staticDictionary[lowerName];
    }
    
    // If no translation service, return as is
    if (!this.translationService || !this.translationService.isConfigured) {
      console.warn('Translation service not available, using original text:', name)
      return name
    }
    
    try {
      // Detect language
      const detectedLanguage = await this.translationService.detectLanguage(name)
      console.log(`Detected language for "${name}": ${detectedLanguage}`)
      
      // If already English, return as is
      if (detectedLanguage === 'en') {
        return name
      }
      
      // Translate to English
      const translatedName = await this.translationService.translateToEnglish(name, detectedLanguage)
      console.log(`Translated ingredient: "${name}" -> "${translatedName}"`)
      return translatedName
    } catch (error) {
      console.error('Translation failed for ingredient:', name, error)
      return name
    }
  }

  // Helper function to normalize ingredient strings
  async normalizeIngredientString(ingredient) {
    const { name, amount, unit } = ingredient
    
    // Normalize ingredient name to English
    const normalizedName = await this.normalizeIngredientName(name)
    
    // Convert units to more standard forms that Edamam recognizes
    const unitMapping = {
      'г': 'g',
      'кг': 'kg', 
      'мл': 'ml',
      'л': 'l',
      'шт': 'piece',
      'ст.л.': 'tbsp',
      'ч.л.': 'tsp',
      'склянка': 'cup',
      'пучок': 'bunch'
    }
    
    const normalizedUnit = unitMapping[unit] || unit
    
    // Format: "amount unit ingredient_name"
    // Use more standard format that Edamam expects
    let ingredientString
    
    if (normalizedUnit === 'piece' || normalizedUnit === 'шт') {
      // For pieces, use format like "1 large apple" or "2 medium tomatoes"
      const pieceAmount = Math.round(amount)
      if (pieceAmount === 1) {
        ingredientString = `1 medium ${normalizedName}`
      } else {
        ingredientString = `${pieceAmount} medium ${normalizedName}s`
      }
    } else {
      ingredientString = `${amount}${normalizedUnit} ${normalizedName}`
    }
    
    console.log(`Normalized ingredient: "${name}" ${amount} ${unit} -> "${ingredientString}"`)
    
    return ingredientString
  }

  // Helper function to get measure URI based on unit
  getMeasureURI(unit) {
    const measureMapping = {
      'г': 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
      'gram': 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
      'кг': 'http://www.edamam.com/ontologies/edamam.owl#Measure_kilogram',
      'kilogram': 'http://www.edamam.com/ontologies/edamam.owl#Measure_kilogram',
      'мл': 'http://www.edamam.com/ontologies/edamam.owl#Measure_milliliter',
      'milliliter': 'http://www.edamam.com/ontologies/edamam.owl#Measure_milliliter',
      'л': 'http://www.edamam.com/ontologies/edamam.owl#Measure_liter',
      'liter': 'http://www.edamam.com/ontologies/edamam.owl#Measure_liter',
      'шт': 'http://www.edamam.com/ontologies/edamam.owl#Measure_unit',
      'piece': 'http://www.edamam.com/ontologies/edamam.owl#Measure_unit',
      'ст.л.': 'http://www.edamam.com/ontologies/edamam.owl#Measure_tablespoon',
      'tablespoon': 'http://www.edamam.com/ontologies/edamam.owl#Measure_tablespoon',
      'ч.л.': 'http://www.edamam.com/ontologies/edamam.owl#Measure_teaspoon',
      'teaspoon': 'http://www.edamam.com/ontologies/edamam.owl#Measure_teaspoon',
      'склянка': 'http://www.edamam.com/ontologies/edamam.owl#Measure_cup',
      'cup': 'http://www.edamam.com/ontologies/edamam.owl#Measure_cup'
    }
    
    return measureMapping[unit] || 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram'
  }

  // Nutrition Analysis API methods with structured data support
  async analyzeNutrition(ingredients) {
    console.log('analyzeNutrition called with:', { 
      ingredientsCount: ingredients?.length,
      ingredients: ingredients,
      isConfigured: this.isNutritionApiConfigured,
      nutritionAppId: this.nutritionAppId ? `${this.nutritionAppId.substring(0, 4)}...` : 'missing',
      nutritionAppKey: this.nutritionAppKey ? `${this.nutritionAppKey.substring(0, 4)}...` : 'missing'
    })

    if (!this.isNutritionApiConfigured) {
      console.error('Nutrition API not configured:', {
        nutritionAppId: this.nutritionAppId,
        nutritionAppKey: this.nutritionAppKey
      })
      return {
        success: false,
        error: 'Edamam Nutrition Analysis API не налаштовано. Додайте EDAMAM_APP_NUTRITION_ID та EDAMAM_APP_NUTRITION_KEY до .env файлу'
      }
    }

    try {
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Ingredients array is required')
      }
      
      // Limit ingredients to maximum allowed
      let ingredientsToAnalyze = ingredients;
      let limitApplied = false;
      
      if (ingredients.length > this.MAX_INGREDIENTS) {
        console.warn(`Too many ingredients (${ingredients.length}), limiting to ${this.MAX_INGREDIENTS}`)
        ingredientsToAnalyze = ingredients.slice(0, this.MAX_INGREDIENTS);
        limitApplied = true;
      }

      // Use text-based analysis for all ingredients
      return this.analyzeNutritionWithText(ingredientsToAnalyze, limitApplied, ingredients.length)

    } catch (error) {
      console.error('Nutrition analysis error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Nutrition analysis with text-based ingredients
  async analyzeNutritionWithText(ingredients, limitApplied = false, originalCount = 0) {
    try {
      // Prepare normalized ingredient strings
      const normalizedIngredients = await Promise.all(
        ingredients.map(async ingredient => {
          return await this.normalizeIngredientString(ingredient);
        })
      );

      console.log('Sending request to Edamam Nutrition Analysis API:', {
        url: this.nutritionAnalysisUrl,
        ingredients: normalizedIngredients,
        originalIngredients: ingredients
      })

      const url = `${this.nutritionAnalysisUrl}?app_id=${this.nutritionAppId}&app_key=${this.nutritionAppKey}`

      const requestBody = {
        title: "Recipe Nutrition Analysis",
        ingr: normalizedIngredients
      }

      console.log('Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Edamam Nutrition Analysis API response status:', response.status)

      const data = await response.json()
      console.log('Edamam Nutrition Analysis API response data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        // Handle specific Edamam API errors
        if (response.status === 401) {
          throw new Error('Неправильні credentials для Edamam Nutrition Analysis API. Перевірте EDAMAM_APP_NUTRITION_ID та EDAMAM_APP_NUTRITION_KEY')
        }
        if (response.status === 422) {
          console.error('Unprocessable ingredients:', {
            ingredients: normalizedIngredients,
            response: data
          })
          throw new Error(`Не вдалося розпізнати інгредієнти. Спробуйте використати англійські назви (наприклад: "apple", "rice") та стандартні одиниці виміру (g, kg, ml, l)`)
        }
        if (response.status === 403) {
          throw new Error('Доступ заборонено. Перевірте ваші API credentials та ліміти')
        }
        if (response.status === 429) {
          throw new Error('Перевищено ліміт запитів. Спробуйте пізніше')
        }
        if (response.status === 555) {
          throw new Error('Низька якість даних. Спробуйте додати більше деталей до інгредієнтів')
        }
        throw new Error(`Edamam Nutrition Analysis API error (${response.status}): ${data.message || data.error || 'Unknown error'}`)
      }

      // Check for empty data
      if (!data.calories && (!data.totalNutrients || Object.keys(data.totalNutrients).length === 0)) {
        throw new Error('API повернув порожні дані. Можливо, інгредієнти не розпізнано. Спробуйте використати англійські назви інгредієнтів (наприклад: "apple" замість "яблуко", "rice" замість "рис")')
      }

      const result = this.processNutritionResponse(data);
      
      // Add information about ingredient limit
      if (limitApplied) {
        result.limitApplied = true;
        result.originalCount = originalCount;
        result.analyzedCount = ingredients.length;
        result.message = `Аналіз обмежено до ${this.MAX_INGREDIENTS} інгредієнтів із ${originalCount}`;
      }
      
      return result;

    } catch (error) {
      throw error
    }
  }

  // Common method to process nutrition response from either API
  processNutritionResponse(data) {
    console.log('Processing nutrition response:', {
      hasCalories: !!data.calories,
      hasTotalNutrients: !!data.totalNutrients,
      calories: data.calories,
      totalNutrientsKeys: data.totalNutrients ? Object.keys(data.totalNutrients) : []
    })

    // Check if we got valid nutrition data
    if (!data.calories && (!data.totalNutrients || Object.keys(data.totalNutrients).length === 0)) {
      console.warn('No nutrition data returned:', data)
      throw new Error('API повернув порожні дані. Можливо, інгредієнти не розпізнано. Спробуйте використати англійські назви інгредієнтів (наприклад: "apple" замість "яблуко", "rice" замість "рис")')
    }

    // Extract key nutritional information
    const nutrition = {
      calories: Math.round(data.calories || 0),
      totalWeight: Math.round(data.totalWeight || 0),
      servings: data.yield || 1,
      caloriesPerServing: Math.round((data.calories || 0) / (data.yield || 1)),
      totalNutrients: data.totalNutrients || {},
      totalDaily: data.totalDaily || {},
      dietLabels: data.dietLabels || [],
      healthLabels: data.healthLabels || [],
      cautions: data.cautions || [],
      ingredients: data.ingredients || []
    }

    // Extract main macronutrients with better error handling
    const macros = {
      protein: {
        quantity: Math.round((nutrition.totalNutrients.PROCNT?.quantity || 0) * 10) / 10,
        unit: nutrition.totalNutrients.PROCNT?.unit || 'g'
      },
      fat: {
        quantity: Math.round((nutrition.totalNutrients.FAT?.quantity || 0) * 10) / 10,
        unit: nutrition.totalNutrients.FAT?.unit || 'g'
      },
      carbs: {
        quantity: Math.round((nutrition.totalNutrients.CHOCDF?.quantity || 0) * 10) / 10,
        unit: nutrition.totalNutrients.CHOCDF?.unit || 'g'
      },
      fiber: {
        quantity: Math.round((nutrition.totalNutrients.FIBTG?.quantity || 0) * 10) / 10,
        unit: nutrition.totalNutrients.FIBTG?.unit || 'g'
      },
      sugar: {
        quantity: Math.round((nutrition.totalNutrients.SUGAR?.quantity || 0) * 10) / 10,
        unit: nutrition.totalNutrients.SUGAR?.unit || 'g'
      },
      sodium: {
        quantity: Math.round((nutrition.totalNutrients.NA?.quantity || 0) * 10) / 10,
        unit: nutrition.totalNutrients.NA?.unit || 'mg'
      }
    }

    console.log('Processed nutrition data:', {
      calories: nutrition.calories,
      macros: macros,
      totalNutrients: Object.keys(nutrition.totalNutrients)
    })

    return {
      success: true,
      nutrition: {
        ...nutrition,
        macros
      }
    }
  }

  async analyzeRecipeNutrition(recipe) {
    try {
      const { ingredients, servings = 1 } = recipe

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Recipe must contain ingredients')
      }

      const nutritionResult = await this.analyzeNutrition(ingredients)

      if (!nutritionResult.success) {
        return nutritionResult
      }

      // Adjust nutrition data for actual servings
      const nutrition = nutritionResult.nutrition
      const actualServings = servings || nutrition.servings || 1

      const adjustedNutrition = {
        ...nutrition,
        servings: actualServings,
        caloriesPerServing: Math.round(nutrition.calories / actualServings),
        macrosPerServing: {
          protein: {
            quantity: Math.round((nutrition.macros.protein.quantity / actualServings) * 10) / 10,
            unit: nutrition.macros.protein.unit
          },
          fat: {
            quantity: Math.round((nutrition.macros.fat.quantity / actualServings) * 10) / 10,
            unit: nutrition.macros.fat.unit
          },
          carbs: {
            quantity: Math.round((nutrition.macros.carbs.quantity / actualServings) * 10) / 10,
            unit: nutrition.macros.carbs.unit
          },
          fiber: {
            quantity: Math.round((nutrition.macros.fiber.quantity / actualServings) * 10) / 10,
            unit: nutrition.macros.fiber.unit
          },
          sugar: {
            quantity: Math.round((nutrition.macros.sugar.quantity / actualServings) * 10) / 10,
            unit: nutrition.macros.sugar.unit
          },
          sodium: {
            quantity: Math.round((nutrition.macros.sodium.quantity / actualServings) * 10) / 10,
            unit: nutrition.macros.sodium.unit
          }
        }
      }
      
      // Pass information about ingredient limit if it exists
      if (nutritionResult.limitApplied) {
        adjustedNutrition.limitApplied = nutritionResult.limitApplied;
        adjustedNutrition.originalCount = nutritionResult.originalCount;
        adjustedNutrition.analyzedCount = nutritionResult.analyzedCount;
        adjustedNutrition.message = nutritionResult.message;
      }

      return {
        success: true,
        nutrition: adjustedNutrition
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Utility methods
  isConfigured() {
    return {
      foodApi: this.isFoodApiConfigured,
      nutritionApi: this.isNutritionApiConfigured,
      both: this.isFoodApiConfigured && this.isNutritionApiConfigured
    }
  }
}