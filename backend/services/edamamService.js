export class EdamamService {
  constructor(appId, appKey) {
    this.appId = appId
    this.appKey = appKey
    this.baseUrl = 'https://api.edamam.com/api/food-database/v2'
  }

  async searchFood(query, limit = 20) {
    try {
      const url = `${this.baseUrl}/parser?app_id=${this.appId}&app_key=${this.appKey}&ingr=${encodeURIComponent(query)}&limit=${limit}`

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
      const url = `${this.baseUrl}/nutrients?app_id=${this.appId}&app_key=${this.appKey}`

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
}
