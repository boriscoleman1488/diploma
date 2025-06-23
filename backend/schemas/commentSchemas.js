export const createCommentSchema = {
    body: {
        type: 'object',
        required: ['content'],
        properties: {
            content: {
                type: 'string',
                minLength: 1,
                maxLength: 1000
            }
        },
        additionalProperties: false
    },
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

export const getCommentsSchema = {
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
                maximum: 50,
                default: 20
            },
            status: {
                type: 'string',
                enum: ['pending', 'approved', 'rejected']
            }
        }
    },
    params: {
        type: 'object',
        properties: {
            dishId: {
                type: 'string',
                format: 'uuid'
            },
            commentId: {
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
                comments: {
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

export const updateCommentSchema = {
    body: {
        type: 'object',
        required: ['content'],
        properties: {
            content: {
                type: 'string',
                minLength: 1,
                maxLength: 1000
            }
        },
        additionalProperties: false
    },
    params: {
        type: 'object',
        required: ['commentId'],
        properties: {
            commentId: {
                type: 'string',
                format: 'uuid'
            }
        }
    }
}

export const deleteCommentSchema = {
    params: {
        type: 'object',
        required: ['commentId'],
        properties: {
            commentId: {
                type: 'string',
                format: 'uuid'
            }
        }
    }
}