export class EdamamService {
  constructor(appId, appKey) {
    this.appId = appId
    this.appKey = appKey
    this.foodDatabaseUrl = 'https://api.edamam.com/api/food-database/v2'
    this.nutritionAnalysisUrl = 'https://api.edamam.com/api/nutrition-details'
  }

  async searchFood(query, limit = 20) {
    try {
      const url = `${this.foodDatabaseUrl}/parser?app_id=${this.appId}&app_key=${this.appKey}&ingr=${encodeURIComponent(query)}&limit=${limit}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Edamam API error: ${data.message || 'Unknown error'}`)
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
    try {
      const url = `${this.foodDatabaseUrl}/nutrients?app_id=${this.appId}&app_key=${this.appKey}`

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
        throw new Error(`Edamam API error: ${data.message || 'Unknown error'}`)
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

  async analyzeNutrition(ingredients) {
    try {
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Ingredients array is required')
      }

      // Convert ingredients to Edamam format
      const edamamIngredients = ingredients.map(ingredient => {
        // Create ingredient string in format "amount unit ingredient_name"
        return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
      })

      const url = `${this.nutritionAnalysisUrl}?app_id=${this.appId}&app_key=${this.appKey}`

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
        throw new Error(`Edamam Nutrition API error: ${data.message || 'Unknown error'}`)
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
}