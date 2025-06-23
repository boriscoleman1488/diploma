export const setRatingSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['rating'],
            properties: {
                rating: {
                    type: 'integer',
                    enum: [0, 1],
                    description: '1 for like, 0 to remove like'
                }
            }
        },
        params: {
            type: 'object',
            required: ['dishId'],
            properties: {
                dishId: { type: 'string', format: 'uuid' }
            }
        }
    }
}

export const getRatingSchema = {
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

export const getRatingsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20
      },
      dishId: {
        type: 'string',
        format: 'uuid'
      },
      userId: {
        type: 'string',
        format: 'uuid'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        ratings: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true
          }
        },
        total: { type: 'number' }
      }
    }
  }
}

export const deleteRatingSchema = {
  params: {
    type: 'object',
    required: ['ratingId'],
    properties: {
      ratingId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}