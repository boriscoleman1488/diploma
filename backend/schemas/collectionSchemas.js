
export const createCollectionSchema = {
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100
            },
            description: {
                type: 'string',
                maxLength: 500
            }
        }
    }
}

export const updateCollectionSchema = {
    params: {
        type: 'object',
        required: ['collectionId'],
        properties: {
            collectionId: {
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100
            },
            description: {
                type: 'string',
                maxLength: 500
            },
            is_public: {
                type: 'boolean'
            }
        }
    }
}

export const addDishToCollectionSchema = {
    params: {
        type: 'object',
        required: ['collectionId'],
        properties: {
            collectionId: {
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
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

export const removeDishFromCollectionSchema = {
    params: {
        type: 'object',
        required: ['collectionId', 'dishId'],
        properties: {
            collectionId: {
                type: 'string',
                format: 'uuid'
            },
            dishId: {
                type: 'string',
                format: 'uuid'
            }
        }
    }
}

export const getCollectionSchema = {
    params: {
        type: 'object',
        required: ['collectionId'],
        properties: {
            collectionId: {
                type: 'string',
                format: 'uuid'
            }
        }
    }
}

export const getDishesByTypeSchema = {
    params: {
        type: 'object',
        required: ['type'],
        properties: {
            type: {
                type: 'string',
                enum: ['my_dishes', 'liked', 'published', 'private']
            }
        }
    }
}

export const getAllCollectionsForAdminSchema = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            collection_type: { type: 'string' },
            user_id: { type: 'string', format: 'uuid' }
        }
    }
}

export const getCollectionDetailsForAdminSchema = {
    params: {
        type: 'object',
        required: ['collectionId'],
        properties: {
            collectionId: {
                type: 'string',
                format: 'uuid'
            }
        }
    }
}