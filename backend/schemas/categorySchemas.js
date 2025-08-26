export const createCategorySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      description: {
        type: 'string',
        maxLength: 500
      }
    },
    additionalProperties: false
  }
}

export const updateCategorySchema = {
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      description: {
        type: 'string',
        maxLength: 500
      }
    },
    additionalProperties: false
  },
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}

export const deleteCategorySchema = {
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}

export const getCategoriesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              created_at: { type: 'string' }
            }
          }
        },
        // count totalDishesFromCategory
        //count emptycategory
        stats: {
          type: 'object',
          properties: {
            countDishesFromCategory: { type: 'integer' },
            countEmptyCategories: { type: 'integer' }
          }
        }
      }
    }
  }
}

export const getCategoryByIdSchema = {
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}

export const searchCategoriesSchema = {
  params: {
    type: 'object',
    required: ['query'],
    properties: {
      query: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      }
    }
  }
}