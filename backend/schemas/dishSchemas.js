export const createDishSchema = {
    body: {
        type: 'object',
        required: ['title', 'description', 'servings', 'ingredients', 'steps'],
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200
            },
            description: {
                type: 'string',
                minLength: 1,
                maxLength: 1000
            },
            category_ids: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'uuid'
                }
            },
            servings: {
                type: 'integer',
                minimum: 1,
                maximum: 50
            },
            ingredients: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['name', 'amount', 'unit'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        amount: { type: 'number', minimum: 0 },
                        unit: { type: 'string', minLength: 1 },
                        edamam_food_id: { type: 'string' }
                    }
                }
            },
            steps: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['description'],
                    properties: {
                        description: { type: 'string', minLength: 1 },
                        image_url: { type: 'string', format: 'uri' },
                        duration_minutes: { type: 'integer', minimum: 0 }
                    }
                }
            },
            main_image_url: {
                type: 'string',
                format: 'uri'
            }
        }
    }
}

export const dishValidationSchema = createDishSchema

export const updateDishSchema = {
  params: {
    type: 'object',
    required: ['dishId'],
    properties: {
      dishId: {
        type: 'string',
        format: 'uuid'
      }
    }
  },
  body: createDishSchema.body
}

export const deleteDishSchema = {
  params: {
    type: 'object',
    required: ['dishId'],
    properties: {
      dishId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}

export const getDishSchema = {
  params: {
    type: 'object',
    required: ['dishId'],
    properties: {
      dishId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}

export const getDishesSchema = {
  description: 'Get all dishes',
  tags: ['dishes'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        dishes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              servings: { type: 'number' },
              main_image_url: { type: 'string' },
              status: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
              user_id: { type: 'string' },
              moderated_at: { type: 'string' },
              rejection_reason: { type: 'string' },
              profiles: {
                type: 'object',
                properties: {
                  full_name: { type: 'string' },
                  email: { type: 'string' },
                  profile_tag: { type: 'string' }
                }
              },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    dish_categories: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' }
                      }
                    }
                  }
                }
              },
              ratings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rating_type: { type: 'string' }
                  }
                }
              },
              comments_count: { type: 'number' }
            },
            additionalProperties: true
          }
        },
        total: { type: 'number' }
      }
    }
  }
}

export const moderateDishSchema = {
  params: {
    type: 'object',
    required: ['dishId'],
    properties: {
      dishId: {
        type: 'string',
        format: 'uuid'
      }
    }
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['approved', 'rejected']
      },
      rejection_reason: {
        type: 'string',
        maxLength: 500
      }
    },
    additionalProperties: false
  }
}