export class AuthService {
    static PROFILE_TAG_MAX_ATTEMPTS = 10
    static PROFILE_TAG_RANDOM_RANGE = 10000
    static DEFAULT_USER_ROLE = 'user'

    static ERROR_MESSAGES = {
        'already registered': 'Користувач з такою електронною адресою вже існує',
        'weak password': 'Пароль занадто слабкий',
        'invalid email': 'Неправильний формат електронної пошти',
        'Invalid login credentials': 'Неправильна електронна пошта або пароль',
        'Email not confirmed': 'Будь ласка, підтвердіть свою електронну пошту перед входом',
        'signups not allowed': 'Реєстрація нових користувачів наразі відключена'
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

        const errorMessage = Object.entries(AuthService.ERROR_MESSAGES)
            .find(([key]) => error.message.includes(key))?.[1] || `${operation} failed`

        return {
            success: false,
            error: errorMessage,
            message: error.message
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
        return `user_${timestamp}`
    }

    async generateUniqueProfileTag(baseName = 'user') {
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

        return this._generateTimestampProfileTag()
    }

    async register(email, password, fullName) {
        try {
            // Register user with Supabase Auth
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    // Disable email confirmation if auto-confirm is enabled in Supabase
                    emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
                }
            })

            if (error) {
                return this._handleError('Registration', error, { email })
            }

            if (!data.user) {
                return {
                    success: false,
                    error: 'Registration failed',
                    message: 'No user data returned after successful registration'
                }
            }

            // Create user profile
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

    async _createUserProfile(user, fullName) {
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
                this.logger.error('Profile creation failed', {
                    error: profileError.message,
                    code: profileError.code,
                    details: profileError.details,
                    userId: user.id,
                    profileTag
                })

                return {
                    success: false,
                    error: 'Profile creation failed',
                    message: profileError.message
                }
            }

            this.logger.info('Profile created successfully', {
                userId: user.id,
                profileTag,
                profileData
            })

            return {
                success: true,
                profileTag,
                profileData
            }

        } catch (error) {
            return this._handleError('Profile creation', error, { userId: user.id })
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
                    message: 'No user or session data returned'
                }
            }

            const responseData = {
                message: 'Login successful',
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

            return this._handleSuccess('Logout', { message: 'Logged out successfully' })

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
                    message: 'No session data returned'
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
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password`
            })

            if (error) {
                return this._handleError('Password reset', error, { email })
            }

            return this._handleSuccess('Password reset',
                { message: 'Password reset email sent successfully' },
                { email }
            )

        } catch (error) {
            return this._handleError('Password reset', error, { email })
        }
    }

    async resendConfirmation(email) {
        try {
            const { error } = await this.supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
                }
            })

            if (error) {
                return this._handleError('Confirmation resend', error, { email })
            }

            return this._handleSuccess('Confirmation resend',
                { message: 'Confirmation email sent. Please check your inbox.' },
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
                    message: 'No user found for this token'
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