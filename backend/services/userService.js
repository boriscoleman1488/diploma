export class UserService {
    constructor(supabase, logger, emailService = null) {
        this.supabase = supabase
        this.logger = logger
        this.emailService = emailService
        
        this.USER_ROLES = {
            USER: 'user',
            ADMIN: 'admin'
        }
        
        this.ERRORS = {
            PROFILE_NOT_FOUND: 'Profile not found',
            TAG_EXISTS: 'Profile tag already exists',
            INVALID_FILE_TYPE: 'Invalid file type',
            FILE_TOO_LARGE: 'File too large',
            INVALID_ROLE: 'Invalid role',
            INTERNAL_ERROR: 'Internal server error',
            UPLOAD_FAILED: 'Upload failed'
        }
        
        this.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        this.MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    }

    // Допоміжні методи
    _handleSuccess(data, message = null) {
        return {
            success: true,
            ...(message && { message }),
            ...data
        }
    }

    _handleError(error, defaultMessage, logContext = {}) {
        this.logger.error(defaultMessage, { error: error.message, ...logContext })
        return {
            success: false,
            error: defaultMessage,
            message: error.message || 'Unable to process request'
        }
    }

    _validateUserId(userId) {
        if (!userId || typeof userId !== 'string') {
            throw new Error('Valid user ID is required')
        }
    }

    _validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            throw new Error('Valid email is required')
        }
    }

    _validateRole(role) {
        if (!Object.values(this.USER_ROLES).includes(role)) {
            throw new Error(`Role must be one of: ${Object.values(this.USER_ROLES).join(', ')}`)
        }
    }

    _validateImageFile(fileBuffer, mimetype) {
        if (!this.ALLOWED_IMAGE_TYPES.includes(mimetype)) {
            throw new Error('Only JPG, PNG and WebP images are allowed')
        }
        
        if (fileBuffer.length > this.MAX_FILE_SIZE) {
            throw new Error('Image size must be less than 5MB')
        }
    }

    async _checkProfileTagExists(profileTag, excludeUserId = null) {
        let query = this.supabase
            .from('profiles')
            .select('id')
            .eq('profile_tag', profileTag)
            
        if (excludeUserId) {
            query = query.neq('id', excludeUserId)
        }
        
        const { data } = await query.maybeSingle()
        return !!data
    }

    async getProfile(userId) {
        try {
            this._validateUserId(userId)
            
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return this._handleError(new Error('Profile not found'), this.ERRORS.PROFILE_NOT_FOUND, { userId })
                }
                return this._handleError(error, 'Unable to fetch profile', { userId })
            }

            this.logger.info('Profile fetched successfully', { userId })
            return this._handleSuccess({ profile })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
        }
    }

    async updateProfile(userId, email, profileData) {
        try {
            this._validateUserId(userId)
            this._validateEmail(email)
            
            const { full_name, profile_tag, avatar_url } = profileData

            if (profile_tag) {
                const tagExists = await this._checkProfileTagExists(profile_tag, userId)
                if (tagExists) {
                    return this._handleError(
                        new Error('This profile tag is already taken by another user'),
                        this.ERRORS.TAG_EXISTS
                    )
                }
            }

            const { data, error } = await this.supabase
                .from('profiles')
                .update({
                    email,
                    full_name,
                    profile_tag,
                    avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single()

            if (error) {
                return this._handleError(error, 'Unable to update profile', { userId })
            }

            this.logger.info('Profile updated successfully', { userId })
            return this._handleSuccess({ profile: data }, 'Profile updated successfully')
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
        }
    }

    async getUserByTag(profileTag) {
        try {
            if (!profileTag) {
                throw new Error('Profile tag is required')
            }
            
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('id, email, full_name, profile_tag, avatar_url, created_at')
                .eq('profile_tag', profileTag)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return this._handleError(
                        new Error('No user found with this profile tag'),
                        'User not found',
                        { profileTag }
                    )
                }
                return this._handleError(error, 'Unable to search user', { profileTag })
            }

            return this._handleSuccess({ profile })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { profileTag })
        }
    }

    async getPublicProfile(userId) {
        try {
            this._validateUserId(userId)
            
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('id, full_name, bio, avatar_url, created_at')
                .eq('id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return this._handleError(
                        new Error('The requested user profile does not exist'),
                        'User not found',
                        { userId }
                    )
                }
                return this._handleError(error, 'Unable to fetch profile', { userId })
            }

            this.logger.info('Public profile fetched', { userId })
            return this._handleSuccess({ profile })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
        }
    }

    async getUserStats(user) {
        try {
            if (!user || !user.id) {
                throw new Error('Valid user object is required')
            }
            
            const stats = {
                recipesCreated: 0,
                favoriteRecipes: 0,
                lastLogin: user.lastSignIn || 'Unknown',
                emailConfirmed: user.emailConfirmed
            }

            this.logger.info('User stats fetched', { userId: user.id, stats })
            return this._handleSuccess({ stats })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId: user?.id })
        }
    }

    async changePassword(email, currentPassword, newPassword) {
        try {
            this._validateEmail(email)
            
            if (!currentPassword || !newPassword) {
                throw new Error('Current password and new password are required')
            }
            
            if (newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters long')
            }

            const { error: signInError } = await this.supabase.auth.signInWithPassword({
                email,
                password: currentPassword
            })

            if (signInError) {
                return this._handleError(
                    new Error('Please verify your current password'),
                    'Current password is incorrect'
                )
            }

            const { error: updateError } = await this.supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                return this._handleError(updateError, 'Unable to update password', { email })
            }

            // Send password change notification email
            if (this.emailService) {
                try {
                    // Get user profile for full name
                    const { data: profile } = await this.supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('email', email)
                        .single()

                    await this.emailService.sendPasswordChangeNotification(
                        email, 
                        profile?.full_name
                    )
                } catch (emailError) {
                    this.logger.warn('Failed to send password change notification', { 
                        error: emailError.message, 
                        email 
                    })
                }
            }

            this.logger.info('Password updated successfully', { email })
            return this._handleSuccess({}, 'Password updated successfully')
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { email })
        }
    }

    async uploadAvatar(userId, fileBuffer, mimetype, filename) {
        try {
            this._validateUserId(userId)
            this._validateImageFile(fileBuffer, mimetype)

            // Generate unique filename with user ID prefix (required by RLS policy)
            const fileExtension = mimetype.split('/')[1]
            const uniqueFilename = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

            this.logger.info('Starting avatar upload', { 
                userId, 
                filename: uniqueFilename,
                fileSize: fileBuffer.length,
                mimetype 
            })

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('avatars')
                .upload(uniqueFilename, fileBuffer, {
                    contentType: mimetype,
                    upsert: false
                })

            if (uploadError) {
                this.logger.error('Avatar upload failed', { 
                    error: uploadError.message, 
                    code: uploadError.statusCode,
                    userId, 
                    filename: uniqueFilename 
                })
                return this._handleError(uploadError, 'Не вдалося завантажити файл')
            }

            this.logger.info('Avatar uploaded to storage successfully', { 
                userId, 
                filename: uniqueFilename,
                path: uploadData.path 
            })

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(uniqueFilename)

            if (!urlData.publicUrl) {
                return this._handleError(
                    new Error('Failed to get public URL'),
                    'Не вдалося отримати посилання на файл'
                )
            }

            this.logger.info('Got public URL for avatar', { 
                userId, 
                publicUrl: urlData.publicUrl 
            })

            // Update user profile with new avatar URL
            const { data: profile, error: updateError } = await this.supabase
                .from('profiles')
                .update({
                    avatar_url: urlData.publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single()

            if (updateError) {
                this.logger.error('Failed to update profile with avatar URL', { 
                    error: updateError.message, 
                    userId,
                    publicUrl: urlData.publicUrl 
                })
                
                // Try to clean up uploaded file
                await this.supabase.storage
                    .from('avatars')
                    .remove([uniqueFilename])
                    .catch(() => {}) // Ignore cleanup errors

                return this._handleError(updateError, 'Не вдалося оновити профіль з аватаром')
            }

            this.logger.info('Avatar uploaded successfully', { 
                userId, 
                filename: uniqueFilename,
                publicUrl: urlData.publicUrl 
            })

            return this._handleSuccess({
                avatarUrl: urlData.publicUrl,
                profile: profile
            }, 'Аватар завантажено успішно')
            
        } catch (error) {
            this.logger.error('Avatar upload error', { 
                error: error.message, 
                userId,
                stack: error.stack 
            })
            return this._handleError(error, 'Не вдалося завантажити аватар', { userId })
        }
    }

    async deleteProfile(userId) {
        try {
            this._validateUserId(userId)
            
            const { error: profileError } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId)

            if (profileError) {
                return this._handleError(profileError, 'Unable to delete profile', { userId })
            }

            this.logger.info('Profile deleted successfully', { userId })
            return this._handleSuccess({}, 'Profile deleted successfully')
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
        }
    }

    async getAllUsers(page = 1, limit = 10, search = '') {
        try {
            const pageNum = Math.max(1, parseInt(page))
            const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
            const offset = (pageNum - 1) * limitNum
            
            let query = this.supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .range(offset, offset + limitNum - 1)
                .order('created_at', { ascending: false })

            if (search?.trim()) {
                const searchTerm = search.trim()
                query = query.or(`full_name.ilike.%${searchTerm}%,profile_tag.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
            }

            const { data: users, error, count } = await query

            if (error) {
                return this._handleError(error, 'Unable to fetch users')
            }

            return this._handleSuccess({
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: count,
                    totalPages: Math.ceil(count / limitNum)
                }
            })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR)
        }
    }

    async getUserDetailsForAdmin(userId) {
        try {
            this._validateUserId(userId)
            
            const { data: user, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return this._handleError(new Error('User not found'), 'User not found', { userId })
                }
                return this._handleError(error, 'Unable to fetch user details', { userId })
            }

            return this._handleSuccess({ user })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
        }
    }

    async updateUserRole(userId, role) {
        try {
            this._validateUserId(userId)
            this._validateRole(role)

            const { data: existingUser, error: checkError } = await this.supabase
                .from('profiles')
                .select('id, role')
                .eq('id', userId)
                .maybeSingle()

            if (checkError) {
                return this._handleError(checkError, 'Unable to check user', { userId })
            }

            if (!existingUser) {
                return this._handleError(
                    new Error('No user found with the provided ID'),
                    'User not found'
                )
            }

            const { data, error } = await this.supabase
                .from('profiles')
                .update({ role, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select()
                .single()

            if (error) {
                return this._handleError(error, 'Unable to update user role', { userId, role })
            }

            this.logger.info('User role updated successfully', { userId, role })
            return this._handleSuccess({ user: data }, 'User role updated successfully')
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId, role })
        }
    }

    async deleteUserByAdmin(userId, supabaseAdmin) {
        try {
            this._validateUserId(userId)
            
            // First, check if user exists
            const { data: existingUser, error: checkError } = await this.supabase
                .from('profiles')
                .select('id, email')
                .eq('id', userId)
                .single()

            if (checkError || !existingUser) {
                return this._handleError(
                    new Error('User not found'),
                    'User not found',
                    { userId }
                )
            }

            // Delete from auth.users table using admin client
            if (supabaseAdmin) {
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

                if (authError) {
                    this.logger.error('Failed to delete user from auth', { 
                        error: authError.message, 
                        userId,
                        userEmail: existingUser.email 
                    })
                    return this._handleError(authError, 'Unable to delete user account', { userId })
                }
            }

            // The profile should be automatically deleted due to foreign key constraint
            // But let's verify and clean up if needed
            const { error: profileError } = await this.supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            // Don't fail if profile is already deleted
            if (profileError && profileError.code !== 'PGRST116') {
                this.logger.warn('Profile cleanup failed but user was deleted from auth', { 
                    error: profileError.message, 
                    userId 
                })
            }
            
            this.logger.info('User deleted successfully by admin', { 
                userId, 
                userEmail: existingUser.email 
            })
            return this._handleSuccess({}, 'User deleted successfully')
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
        }
    }

    async getSystemStats() {
        try {
            const [usersResult, roleStatsResult] = await Promise.allSettled([
                this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
                this.supabase.from('profiles').select('role')
            ])

            if (usersResult.status === 'rejected') {
                return this._handleError(usersResult.reason, 'Unable to fetch system stats')
            }

            if (roleStatsResult.status === 'rejected') {
                return this._handleError(roleStatsResult.reason, 'Unable to fetch role stats')
            }

            const { count: totalUsers } = usersResult.value
            const { data: roleStats } = roleStatsResult.value

            const roleCounts = roleStats.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1
                return acc
            }, {})

            return this._handleSuccess({
                stats: {
                    totalUsers,
                    roleDistribution: roleCounts,
                    generatedAt: new Date().toISOString()
                }
            })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR)
        }
    }

    async searchUsersByTag(query) {
        try {
            if (!query?.trim()) {
                return this._handleSuccess({ users: [] })
            }
            
            const searchQuery = query.trim()
            const { data: users, error } = await this.supabase
                .from('profiles')
                .select('id, full_name, profile_tag, avatar_url')
                .ilike('profile_tag', `%${searchQuery}%`)
                .limit(20)

            if (error) {
                return this._handleError(error, 'Unable to search users', { query: searchQuery })
            }

            return this._handleSuccess({ users })
            
        } catch (error) {
            return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { query })
        }
    }
}

export default UserService