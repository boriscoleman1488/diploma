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
    
    // Додати translation service
    this.translationService = config.translationService
    
    // Максимальна кількість інгредієнтів для аналізу
    this.MAX_INGREDIENTS = 20
    
    // Максимальна кількість інгредієнтів для одного запиту до Food Database API
    this.MAX_INGREDIENTS_PER_REQUEST = 2
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
      // Перекласти запит на англійську для Edamam API
      let translatedQuery = query;
      let originalQuery = query;
      
      if (this.translationService && this.translationService.isConfigured) {
        try {
          // Визначити мову запиту
          const detectedLanguage = await this.translationService.detectLanguage(query);
          
          // Якщо не англійська, перекласти
          if (detectedLanguage !== 'en') {
            translatedQuery = await this.translationService.translateToEnglish(query, detectedLanguage);
            console.log(`Translated query: "${query}" -> "${translatedQuery}"`);
          }
        } catch (translationError) {
          console.error('Translation error during search:', translationError);
          // Продовжуємо з оригінальним запитом при помилці перекладу
        }
      }
      
      const url = `${this.foodDatabaseUrl}/parser?app_id=${this.foodAppId}&app_key=${this.foodAppKey}&ingr=${encodeURIComponent(translatedQuery)}&limit=${limit}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Edamam API error')
      }
      
      const foods = []
      
      // Обробити результати
      if (data.parsed && data.parsed.length > 0) {
        for (const item of data.parsed) {
          const food = item.food
          
          // Перекласти назву назад на українську для відображення
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
            label: displayLabel, // Українська назва для відображення
            originalLabel: food.label, // Англійська назва для збереження
            category: food.category,
            image: food.image,
            nutrients: food.nutrients
          })
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

  // Helper function to normalize ingredient names to English
  async normalizeIngredientName(name) {
    // Спочатку спробувати статичний словник для швидкості
    
    const lowerName = name.toLowerCase().trim()
    
    
    // Якщо немає translation service, повернути як є
    if (!this.translationService || !this.translationService.isConfigured) {
      return name
    }
    
    try {
      // Визначити мову
      const detectedLanguage = await this.translationService.detectLanguage(name)
      
      // Якщо вже англійська, повернути як є
      if (detectedLanguage === 'en') {
        return name
      }
      
      // Перекласти на англійську
      const translatedName = await this.translationService.translateToEnglish(name, detectedLanguage)
      return translatedName
    } catch (error) {
      console.error('Translation failed for ingredient:', name, error)
      return name
    }
  }

  // Helper function to normalize ingredient strings
  normalizeIngredientString(ingredient) {
    const { name, amount, unit } = ingredient
    
    // Normalize ingredient name to English
    const normalizedName = this.normalizeIngredientName(name)
    
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
      
      // Обмеження кількості інгредієнтів до максимально допустимої
      let ingredientsToAnalyze = ingredients;
      let limitApplied = false;
      
      if (ingredients.length > this.MAX_INGREDIENTS) {
        console.warn(`Too many ingredients (${ingredients.length}), limiting to ${this.MAX_INGREDIENTS}`)
        ingredientsToAnalyze = ingredients.slice(0, this.MAX_INGREDIENTS);
        limitApplied = true;
      }

      // Check if all ingredients have edamam_food_id for structured analysis
      const allHaveFoodId = ingredientsToAnalyze.every(ingredient => ingredient.edamam_food_id)
      
      if (allHaveFoodId) {
        console.log('Using structured ingredient data (Food Database API)')
        
        // Use structured ingredient data for better accuracy
        const structuredIngredients = ingredientsToAnalyze.map(ingredient => ({
          quantity: parseFloat(ingredient.amount),
          measureURI: this.getMeasureURI(ingredient.unit),
          foodId: ingredient.edamam_food_id
        }))

        console.log('Structured ingredients:', structuredIngredients)

        // Process ingredients in batches to avoid "Too many ingredients" error
        const batchSize = this.MAX_INGREDIENTS_PER_REQUEST;
        const batches = [];
        
        for (let i = 0; i < structuredIngredients.length; i += batchSize) {
          batches.push(structuredIngredients.slice(i, i + batchSize));
        }
        
        console.log(`Processing ${structuredIngredients.length} ingredients in ${batches.length} batches of max ${batchSize} ingredients each`);
        
        // Process each batch and combine results
        let combinedNutrients = {};
        let totalWeight = 0;
        let totalCalories = 0;
        let successfulBatches = 0;
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} ingredients`);
          
          try {
            // Use Food Database nutrients endpoint for structured data
            const url = `${this.foodDatabaseUrl}/nutrients?app_id=${this.foodAppId}&app_key=${this.foodAppKey}`
            
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ingredients: batch
              })
            })

            console.log(`Batch ${i+1} response status:`, response.status)

            if (!response.ok) {
              if (response.status === 401) {
                throw new Error('Неправильні credentials для Edamam Food Database API')
              }
              if (response.status === 422) {
                console.error('Unprocessable structured ingredients in batch:', {
                  ingredients: batch,
                  response: await response.json()
                })
                // Continue with next batch instead of failing completely
                continue
              }
              if (response.status === 429) {
                throw new Error('Перевищено ліміт запитів. Спробуйте пізніше')
              }
              
              const errorData = await response.json();
              throw new Error(`Edamam Food Database API error (${response.status}): ${errorData.message || 'Unknown error'}`)
            }

            const data = await response.json()
            console.log(`Batch ${i+1} response data:`, JSON.stringify(data, null, 2))
            
            // Combine results from this batch
            totalWeight += data.totalWeight || 0;
            totalCalories += data.calories || 0;
            successfulBatches++;
            
            // Combine nutrients
            if (data.totalNutrients) {
              Object.entries(data.totalNutrients).forEach(([key, value]) => {
                if (!combinedNutrients[key]) {
                  combinedNutrients[key] = { ...value, quantity: 0 };
                }
                combinedNutrients[key].quantity += value.quantity;
              });
            }
          } catch (batchError) {
            console.error(`Error processing batch ${i+1}:`, batchError);
            // Continue with next batch instead of failing completely
          }
        }
        
        // If no batches were successful, fall back to text-based analysis
        if (successfulBatches === 0) {
          console.log('No batches were successful with structured data, falling back to text-based analysis');
          return this.analyzeNutritionWithText(ingredientsToAnalyze, limitApplied, ingredients.length);
        }
        
        // Create a combined result object
        const combinedResult = {
          calories: totalCalories,
          totalWeight: totalWeight,
          totalNutrients: combinedNutrients,
          // We don't have accurate data for these in combined mode
          totalDaily: {},
          dietLabels: [],
          healthLabels: [],
          cautions: []
        };

        // Process structured response
        const result = this.processNutritionResponse(combinedResult);
        
        // Додаємо інформацію про обмеження кількості інгредієнтів
        if (limitApplied) {
          result.limitApplied = true;
          result.originalCount = ingredients.length;
          result.analyzedCount = ingredientsToAnalyze.length;
          result.message = `Аналіз обмежено до ${this.MAX_INGREDIENTS} інгредієнтів із ${ingredients.length}`;
        }
        
        return result;
        
      } else {
        console.log('Using text-based ingredient parsing (some ingredients missing edamam_food_id)')
        return this.analyzeNutritionWithText(ingredientsToAnalyze, limitApplied, ingredients.length)
      }

    } catch (error) {
      console.error('Nutrition analysis error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Fallback method for text-based nutrition analysis
  async analyzeNutritionWithText(ingredients, limitApplied = false, originalCount = 0) {
    try {
      // Convert ingredients to Edamam format with better normalization
      const edamamIngredients = ingredients.map(ingredient => {
        return this.normalizeIngredientString(ingredient)
      })

      console.log('Sending request to Edamam Nutrition Analysis API:', {
        url: this.nutritionAnalysisUrl,
        ingredients: edamamIngredients,
        originalIngredients: ingredients
      })

      const url = `${this.nutritionAnalysisUrl}?app_id=${this.nutritionAppId}&app_key=${this.nutritionAppKey}`

      const requestBody = {
        title: "Recipe Nutrition Analysis",
        ingr: edamamIngredients
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
            ingredients: edamamIngredients,
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

      const result = this.processNutritionResponse(data);
      
      // Додаємо інформацію про обмеження кількості інгредієнтів
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
      
      // Передаємо інформацію про обмеження кількості інгредієнтів, якщо вона є
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