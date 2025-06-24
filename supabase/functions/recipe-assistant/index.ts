import { createClient } from 'npm:@supabase/supabase-js@2.39.7'
import { OpenAI } from 'npm:openai@4.28.0'

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Edamam API credentials
const edamamFoodAppId = Deno.env.get('EDAMAM_APP_FOOD_ID') || ''
const edamamFoodAppKey = Deno.env.get('EDAMAM_APP_FOOD_KEY') || ''

// Function to search for ingredients using Edamam API
async function searchIngredients(query: string, limit = 5) {
  try {
    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${edamamFoodAppId}&app_key=${edamamFoodAppKey}&ingr=${encodeURIComponent(query)}&limit=${limit}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Edamam API error: ${data.message || 'Unknown error'}`)
    }
    
    return {
      success: true,
      foods: data.parsed?.map((item: any) => ({
        foodId: item.food.foodId,
        label: item.food.label,
        category: item.food.category,
        nutrients: item.food.nutrients
      })) || []
    }
  } catch (error) {
    console.error('Error searching ingredients:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Function to get recipe suggestions based on ingredients
async function getRecipeSuggestions(ingredients: string[], preferences: string = '') {
  try {
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      success: true,
      suggestion: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Error getting recipe suggestions:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main handler function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Set CORS headers for all responses
  const headers = {
    ...corsHeaders,
    "Content-Type": "application/json"
  };

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers
      });
    }

    // Verify the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }), {
        status: 401,
        headers
      });
    }

    // Parse the request
    const { action, query, ingredients, preferences } = await req.json();

    // Handle different actions
    if (action === 'search_ingredients') {
      const result = await searchIngredients(query);
      return new Response(JSON.stringify(result), { headers });
    } 
    else if (action === 'get_recipe_suggestions') {
      const result = await getRecipeSuggestions(ingredients, preferences);
      return new Response(JSON.stringify(result), { headers });
    }
    else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }), {
        status: 400,
        headers
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers
    });
  }
});