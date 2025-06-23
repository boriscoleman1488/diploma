export const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'fullName'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 255
      },
      password: {
        type: 'string',
        minLength: 6,
        maxLength: 128
      },
      fullName: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      }
    },
    additionalProperties: false
  }
}

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string',
        minLength: 1
      }
    },
    additionalProperties: false
  }
}

export const refreshTokenSchema = {
  body: {
    type: 'object',
    required: ['refresh_token'],
    properties: {
      refresh_token: {
        type: 'string',
        minLength: 1
      }
    },
    additionalProperties: false
  }
}

export const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      }
    },
    additionalProperties: false
  }
}

export const resendConfirmationSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      }
    },
    additionalProperties: false
  }
}