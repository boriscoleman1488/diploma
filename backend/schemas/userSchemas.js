export const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      full_name: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      profile_tag: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
      },
      avatar_url: {
        type: 'string',
        format: 'uri'
      }
    },
    additionalProperties: false
  }
}

export const getUserSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
}

export const searchUsersSchema = {
  querystring: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0
      }
    }
  }
}

export const changePasswordSchema = {
  body: {
    type: 'object',
    properties: {
      currentPassword: {
        type: 'string',
        minLength: 6
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        maxLength: 128
      }
    },
    required: ['currentPassword', 'newPassword'],
    additionalProperties: false
  }
}

export const searchByTagSchema = {
  params: {
    type: 'object',
    required: ['tag'],
    properties: {
      tag: {
        type: 'string',
        minLength: 3,
        maxLength: 50
      }
    }
  }
}