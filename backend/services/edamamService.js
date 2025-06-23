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
      const url = `${this.foodDatabaseUrl}/parser?app_id=${this.foodAppId}&app_key=${this.foodAppKey}&ingr=${encodeURIComponent(query)}&limit=${limit}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Неправильні credentials для Edamam Food Database API. Перевірте EDAMAM_APP_FOOD_ID та EDAMAM_APP_FOOD_KEY')
        }
        throw new Error(`Edamam Food Database API error: ${data.message || 'Unknown error'}`)
      }

      return {
        success: true,
        foods: data.parsed?.map(item => ({
          foodId: item.food.foodId,
          label: item.food.label,
          category: item.food.category,
          image: item.food.image,
          nutrients: item.food.nutrients
        })) || []
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
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

  // Nutrition Analysis API methods
  async analyzeNutrition(ingredients) {
    if (!this.isNutritionApiConfigured) {
      return {
        success: false,
        error: 'Edamam Nutrition Analysis API не налаштовано. Додайте EDAMAM_APP_NUTRITION_ID та EDAMAM_APP_NUTRITION_KEY до .env файлу'
      }
    }

    try {
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Ingredients array is required')
      }

      // Convert ingredients to Edamam format
      const edamamIngredients = ingredients.map(ingredient => {
        // Create ingredient string in format "amount unit ingredient_name"
        return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
      })

      const url = `${this.nutritionAnalysisUrl}?app_id=${this.nutritionAppId}&app_key=${this.nutritionAppKey}`

      const requestBody = {
        title: "Recipe Nutrition Analysis",
        ingr: edamamIngredients
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific Edamam API errors
        if (response.status === 401) {
          throw new Error('Неправильні credentials для Edamam Nutrition Analysis API. Перевірте EDAMAM_APP_NUTRITION_ID та EDAMAM_APP_NUTRITION_KEY')
        }
        if (response.status === 422) {
          throw new Error('Не вдалося розпізнати деякі інгредієнти. Спробуйте використати більш конкретні назви')
        }
        throw new Error(`Edamam Nutrition Analysis API error: ${data.message || 'Unknown error'}`)
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

      // Extract main macronutrients
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

      return {
        success: true,
        nutrition: {
          ...nutrition,
          macros
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
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