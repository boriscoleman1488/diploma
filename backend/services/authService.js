export class AuthService {
    static PROFILE_TAG_MAX_ATTEMPTS = 50
    static PROFILE_TAG_RANDOM_RANGE = 1000000
    static DEFAULT_USER_ROLE = 'user'
    static PROFILE_CREATION_MAX_RETRIES = 5

    static ERROR_MESSAGES = {
        'already registered': 'Користувач з такою електронною адресою вже існує',
        'weak password': 'Пароль занадто слабкий',
        'invalid email': 'Неправильний формат електронної пошти',
        'Invalid login credentials': 'Неправильна електронна пошта або пароль',
        'Email not confirmed': 'Будь ласка, підтвердіть свою електронну пошту перед входом',
        'signups not allowed': 'Реєстрація нових користувачів наразі відключена',
        'User from sub claim in JWT does not exist': 'Користувач не існує. Будь ласка, зареєструйтеся знову',
        'JWT expired': 'Сесія закінчилася. Будь ласка, увійдіть знову',
        'Invalid JWT': 'Недійсний токен. Будь ласка, увійдіть знову'
    }

    constructor(supabase, logger, emailService = null) {
        this.supabase = supabase
        this.logger = logger
        this.emailService = emailService
    }

    _handleError(operation, error, context = {}) {
        this.logger.error(`${operation} failed`, {
            error: error.message,
            code: error.status || error.code || 'unknown',
            ...context
        })

        // Check for specific error messages and translate them
        let errorMessage = error.message

        // Find matching error message and translate it
        const translatedError = Object.entries(AuthService.ERROR_MESSAGES)
            .find(([key]) => error.message.includes(key))

        if (translatedError) {
            errorMessage = translatedError[1]
        }

        return {
            success: false,
            error: errorMessage,
            message: errorMessage
        }
    }

    _handleSuccess(operation, data, context = {}) {
        this.logger.info(`${operation} successful`, context)
        return {
            success: true,
            ...data
        }
    }

    _generateTimestampProfileTag() {
        const timestamp = Date.now()
        const randomSuffix = Math.floor(Math.random() * 1000)
        return `user_${timestamp}_${randomSuffix}`
    }

    async generateUniqueProfileTag(baseName = 'user') {
        // First, try with random numbers
        for (let attempt = 0; attempt < AuthService.PROFILE_TAG_MAX_ATTEMPTS; attempt++) {
            const randomNum = Math.floor(Math.random() * AuthService.PROFILE_TAG_RANDOM_RANGE) + 1
            const profileTag = `${baseName}_${randomNum}`

            try {
                const { data, error } = await this.supabase
                    .from('profiles')
                    .select('id')
                    .eq('profile_tag', profileTag)
                    .single()

                if (error?.code === 'PGRST116') {
                    // No record found, this tag is unique
                    return profileTag
                }

                if (error && error.code !== 'PGRST116') {
                    this.logger.error('Error checking profile tag uniqueness', {
                        error: error.message,
                        profileTag,
                        attempt
                    })
                }
            } catch (error) {
                this.logger.error('Profile tag generation error', {
                    error: error.message,
                    attempt
                })
            }
        }

        // If random attempts failed, try timestamp-based approach with additional uniqueness
        let timestampAttempts = 0
        const maxTimestampAttempts = 10

        while (timestampAttempts < maxTimestampAttempts) {
            const timestampTag = this._generateTimestampProfileTag()
            
            try {
                const { data, error } = await this.supabase
                    .from('profiles')
                    .select('id')
                    .eq('profile_tag', timestampTag)
                    .single()

                if (error?.code === 'PGRST116') {
                    // No record found, this tag is unique
                    return timestampTag
                }

                if (error && error.code !== 'PGRST116') {
                    this.logger.error('Error checking timestamp profile tag uniqueness', {
                        error: error.message,
                        profileTag: timestampTag,
                        attempt: timestampAttempts
                    })
                }
            } catch (error) {
                this.logger.error('Timestamp profile tag generation error', {
                    error: error.message,
                    attempt: timestampAttempts
                })
            }

            timestampAttempts++
            // Add a small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 1))
        }

        // Final fallback with UUID-like suffix
        const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        return `${baseName}_${Date.now()}_${uuid}`
    }

    async register(email, password, fullName) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
            
            // Register user with Supabase Auth
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${frontendUrl}/auth/callback`
                }
            })

            if (error) {
                return this._handleError('Registration', error, { email })
            }

            if (!data.user) {
                return {
                    success: false,
                    error: 'Registration failed',
                    message: 'Реєстрація не вдалася. Спробуйте ще раз.'
                }
            }

            // Create user profile with retry mechanism
            const profileResult = await this._createUserProfile(data.user, fullName)
            if (!profileResult.success) {
                return profileResult
            }

            // Send welcome email regardless of email confirmation status
            if (this.emailService) {
                try {
                    await this.emailService.sendWelcomeEmail(email, fullName)
                    this.logger.info('Welcome email sent successfully', { email })
                } catch (emailError) {
                    this.logger.warn('Failed to send welcome email', { 
                        error: emailError.message, 
                        email 
                    })
                }
            }

            // Check if email confirmation is required
            const requiresEmailConfirmation = !data.user.email_confirmed_at

            const responseData = {
                message: requiresEmailConfirmation
                    ? 'Реєстрація успішна. Будь ласка, перевірте вашу електронну пошту для підтвердження.'
                    : 'Реєстрація успішна. Тепер ви можете увійти.',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    emailConfirmed: data.user.email_confirmed_at !== null,
                    fullName: data.user.user_metadata?.full_name,
                    profileTag: profileResult.profileTag
                },
                requiresEmailConfirmation
            }

            return this._handleSuccess('Registration', responseData, {
                userId: data.user.id,
                email: data.user.email,
                profileTag: profileResult.profileTag,
                emailConfirmed: !requiresEmailConfirmation,
                confirmationSent: requiresEmailConfirmation
            })

        } catch (error) {
            return this._handleError('Registration', error, { email })
        }
    }

    async _createUserProfile(user, fullName, retryCount = 0) {
        try {
            const profileTag = await this.generateUniqueProfileTag()
            const now = new Date().toISOString()

            const { data: profileData, error: profileError } = await this.supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName,
                    profile_tag: profileTag,
                    role: AuthService.DEFAULT_USER_ROLE,
                    created_at: now,
                    updated_at: now
                }, {
                    onConflict: 'id'
                })
                .select()

            if (profileError) {
                // Check if this is a unique constraint violation on profile_tag
                if (profileError.code === '23505' && 
                    profileError.message.includes('profiles_profile_tag_key')) {
                    
                    this.logger.warn('Profile tag conflict detected, retrying', {
                        userId: user.id,
                        profileTag,
                        retryCount,
                        error: profileError.message
                    })

                    // If we haven't exceeded max retries, try again
                    if (retryCount < AuthService.PROFILE_CREATION_MAX_RETRIES) {
                        // Add a small delay to reduce race condition likelihood
                        await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)))
                        return this._createUserProfile(user, fullName, retryCount + 1)
                    } else {
                        this.logger.error('Profile creation failed after max retries', {
                            userId: user.id,
                            retryCount,
                            maxRetries: AuthService.PROFILE_CREATION_MAX_RETRIES,
                            error: profileError.message
                        })

                        return {
                            success: false,
                            error: 'Profile creation failed',
                            message: 'Не вдалося створити унікальний профіль користувача. Спробуйте ще раз.'
                        }
                    }
                }

                // For other types of errors, log and return immediately
                this.logger.error('Profile creation failed', {
                    error: profileError.message,
                    code: profileError.code,
                    details: profileError.details,
                    userId: user.id,
                    profileTag,
                    retryCount
                })

                return {
                    success: false,
                    error: 'Profile creation failed',
                    message: 'Не вдалося створити профіль користувача'
                }
            }

            this.logger.info('Profile created successfully', {
                userId: user.id,
                profileTag,
                retryCount,
                profileData
            })

            return {
                success: true,
                profileTag,
                profileData
            }

        } catch (error) {
            this.logger.error('Profile creation exception', {
                error: error.message,
                userId: user.id,
                retryCount
            })

            return this._handleError('Profile creation', error, { 
                userId: user.id, 
                retryCount 
            })
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                return this._handleError('Login', error, { email })
            }

            if (!data.user || !data.session) {
                return {
                    success: false,
                    error: 'Authentication failed',
                    message: 'Помилка автентифікації. Спробуйте ще раз.'
                }
            }

            // Check if email is confirmed
            if (!data.user.email_confirmed_at) {
                return {
                    success: false,
                    error: 'Email not confirmed',
                    message: 'Будь ласка, підтвердіть свою електронну пошту перед входом. Перевірте вашу поштову скриньку.'
                }
            }

            const responseData = {
                message: 'Вхід успішний',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    fullName: data.user.user_metadata?.full_name,
                    emailConfirmed: data.user.email_confirmed_at !== null,
                    lastSignIn: data.user.last_sign_in_at
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                    expires_in: data.session.expires_in,
                    token_type: data.session.token_type
                }
            }

            return this._handleSuccess('Login', responseData, {
                userId: data.user.id,
                email: data.user.email,
                lastSignIn: data.user.last_sign_in_at
            })

        } catch (error) {
            return this._handleError('Login', error, { email })
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut()

            if (error) {
                return this._handleError('Logout', error)
            }

            return this._handleSuccess('Logout', { message: 'Вихід успішний' })

        } catch (error) {
            return this._handleError('Logout', error)
        }
    }

    async refreshToken(refreshToken) {
        try {
            const { data, error } = await this.supabase.auth.refreshSession({
                refresh_token: refreshToken
            })

            if (error) {
                return this._handleError('Token refresh', error)
            }

            if (!data.session) {
                return {
                    success: false,
                    error: 'Token refresh failed',
                    message: 'Не вдалося оновити сесію'
                }
            }

            const responseData = {
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                    expires_in: data.session.expires_in,
                    token_type: data.session.token_type
                }
            }

            return this._handleSuccess('Token refresh', responseData)

        } catch (error) {
            return this._handleError('Token refresh', error)
        }
    }

    async forgotPassword(email) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
            
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${frontendUrl}/auth/reset-password`
            })

            if (error) {
                return this._handleError('Password reset', error, { email })
            }

            return this._handleSuccess('Password reset',
                { message: 'Лист для скидання пароля надіслано успішно' },
                { email }
            )

        } catch (error) {
            return this._handleError('Password reset', error, { email })
        }
    }

    async resetPassword(token, password, type = 'recovery') {
        try {
            this.logger.info('Resetting password', { tokenLength: token.length, type })
            
            // First, get the user from the token to verify it's valid
            const { data: { user }, error: getUserError } = await this.supabase.auth.getUser(token)
            
            if (getUserError || !user) {
                this.logger.error('Invalid reset token', { error: getUserError?.message })
                return {
                    success: false,
                    error: 'Invalid or expired reset token',
                    message: 'Токен для скидання пароля недійсний або закінчився термін його дії'
                }
            }
            
            // Create a temporary client with the reset token
            const { createClient } = await import('@supabase/supabase-js')
            const tempClient = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY,
                {
                    global: {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                }
            )
            
            // Use the temporary client to update the password
            const { data, error } = await tempClient.auth.updateUser({
                password: password
            })

            if (error) {
                this.logger.error('Password reset failed', { error: error.message })
                return this._handleError('Password reset', error)
            }

            this.logger.info('Password reset successful', { userId: user.id })
            return this._handleSuccess('Password reset', 
                { message: 'Пароль успішно змінено' }
            )

        } catch (error) {
            this.logger.error('Password reset exception', { error: error.message })
            return this._handleError('Password reset', error)
        }
    }

    async resendConfirmation(email) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
            
            const { error } = await this.supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${frontendUrl}/auth/callback`
                }
            })

            if (error) {
                return this._handleError('Confirmation resend', error, { email })
            }

            return this._handleSuccess('Confirmation resend',
                { message: 'Лист підтвердження надіслано. Будь ласка, перевірте вашу поштову скриньку.' },
                { email }
            )

        } catch (error) {
            return this._handleError('Confirmation resend', error, { email })
        }
    }

    async verifyToken(token) {
        try {
            const { data, error } = await this.supabase.auth.getUser(token)

            if (error) {
                return this._handleError('Token verification', error, { tokenLength: token?.length })
            }

            if (!data.user) {
                return {
                    success: false,
                    error: 'Invalid token',
                    message: 'Недійсний токен'
                }
            }

            const responseData = {
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    fullName: data.user.user_metadata?.full_name,
                    emailConfirmed: data.user.email_confirmed_at !== null
                }
            }

            return this._handleSuccess('Token verification', responseData, {
                userId: data.user.id,
                email: data.user.email
            })

        } catch (error) {
            return this._handleError('Token verification', error, { tokenLength: token?.length })
        }
    }
}