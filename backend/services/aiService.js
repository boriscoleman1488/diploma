export class AiService {
  constructor(logger) {
    this.logger = logger
    this.openaiApiKey = process.env.OPENAI_API_KEY
    this.edamamFoodAppId = process.env.EDAMAM_APP_FOOD_ID
    this.edamamFoodAppKey = process.env.EDAMAM_APP_FOOD_KEY
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
      if (!this.openaiApiKey) {
        this.logger.error('OpenAI API key missing')
        return {
          success: false,
          error: 'OpenAI API key missing'
        }
      }

      this.logger.info('Getting recipe suggestions', { 
        ingredientsCount: ingredients.length,
        hasPreferences: !!preferences
      })

      const systemPrompt = `You are a helpful cooking assistant that suggests recipes based on available ingredients. 
      Focus on practical, easy-to-follow recipes that use the ingredients provided.
      Format your response in markdown with clear sections:
      1. Recipe name (as a heading)
      2. Brief description
      3. Ingredients list (with quantities)
      4. Step-by-step instructions
      5. Cooking time and difficulty level
      
      If the user has dietary preferences or restrictions, adapt your suggestions accordingly.
      If the ingredients list is very limited, suggest simple recipes or recommend a few additional ingredients that would enable more options.`;

      const userMessage = `I have these ingredients: ${ingredients.join(', ')}. ${preferences ? `My preferences: ${preferences}.` : ''} What can I cook?`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('OpenAI API error', { 
          status: response.status, 
          error: errorData.error 
        });
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const suggestion = data.choices[0].message.content;

      this.logger.info('Recipe suggestion generated successfully', { 
        responseLength: suggestion.length 
      });

      return {
        success: true,
        suggestion
      };
    } catch (error) {
      this.logger.error('Error getting recipe suggestions', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}