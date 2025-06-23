export class CommentService {
    constructor(supabase, logger) {
        this.supabase = supabase
        this.logger = logger
    }

    static ERRORS = {
        COMMENT_NOT_FOUND: 'Comment not found',
        COMMENT_DELETED: 'Comment already deleted',
        PERMISSION_DENIED: 'Permission denied',
        CANNOT_EDIT_DELETED: 'Cannot edit deleted comment',
        INTERNAL_ERROR: 'Internal server error',
        DATABASE_ERROR: 'Database error',
        CREATE_ERROR: 'Unable to create comment',
        FETCH_ERROR: 'Unable to fetch comments',
        UPDATE_ERROR: 'Unable to update comment',
        DELETE_ERROR: 'Unable to delete comment'
    }

    static MESSAGES = {
        COMMENT_CREATED: 'Comment created successfully',
        COMMENT_UPDATED: 'Comment updated successfully',
        COMMENT_DELETED: 'Comment deleted successfully',
        COMMENT_NOT_EXIST: 'The specified comment does not exist',
        FETCH_COMMENTS_ADMIN: 'Unable to fetch comments for admin',
        FETCH_COMMENT_DETAILS: 'Unable to fetch comment details',
        FETCH_STATS: 'Unable to fetch comment statistics'
    }

    _handleError(operation, error, customError = null, customMessage = null) {
        this.logger.error(`${operation} error`, { error: error.message })
        return {
            success: false,
            error: customError || CommentService.ERRORS.INTERNAL_ERROR,
            message: customMessage || error.message || 'An unexpected error occurred'
        }
    }

    _handleSuccess(data = {}, message = null) {
        return {
            success: true,
            ...data,
            ...(message && { message })
        }
    }

    async _getCommentById(commentId, selectFields = '*') {
        const { data: comment, error } = await this.supabase
            .from('dish_comments')
            .select(selectFields)
            .eq('id', commentId)
            .single()

        if (error || !comment) {
            return { exists: false, comment: null }
        }

        return { exists: true, comment }
    }

    _checkCommentPermissions(comment, userId, isAdmin = false) {
        if (!comment) {
            return {
                hasPermission: false,
                error: CommentService.ERRORS.COMMENT_NOT_FOUND
            }
        }

        if (!isAdmin && comment.user_id !== userId) {
            return {
                hasPermission: false,
                error: CommentService.ERRORS.PERMISSION_DENIED
            }
        }

        return { hasPermission: true }
    }

    _buildCommentQuery(baseQuery, includeProfiles = true) {
        const profileFields = includeProfiles ? 'profiles!user_id(full_name, avatar_url)' : ''
        return baseQuery.select(`
            *,
            ${profileFields}
        `)
    }


    async createComment(userId, commentData) {
        try {
            const { dish_id, content } = commentData

            const { data: dish, error: dishError } = await this.supabase
                .from('dishes')
                .select('id')
                .eq('id', dish_id)
                .single()

            if (dishError || !dish) {
                return this._handleError(
                    'Comment creation',
                    new Error('Dish not found'),
                    CommentService.ERRORS.CREATE_ERROR,
                    'The specified dish does not exist'
                )
            }

            const { data: comment, error } = await this.supabase
                .from('dish_comments')
                .insert({
                    dish_id,
                    user_id: userId,
                    content
                })
                .select(`
                    *,
                    profiles!user_id(full_name, avatar_url)
                `)
                .single()

            if (error) {
                return this._handleError('Comment creation', error, CommentService.ERRORS.CREATE_ERROR)
            }

            return this._handleSuccess({ comment }, CommentService.MESSAGES.COMMENT_CREATED)
        } catch (error) {
            return this._handleError('Comment creation', error)
        }
    }

    async getCommentsByDish(dishId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit

            const { data: comments, error } = await this.supabase
                .from('dish_comments')
                .select(`
                    *,
                    profiles!user_id(full_name, avatar_url)
                `)
                .eq('dish_id', dishId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) {
                return this._handleError('Comments fetch', error, CommentService.ERRORS.FETCH_ERROR)
            }

            return this._handleSuccess({ comments: comments || [] })
        } catch (error) {
            return this._handleError('Comments fetch', error)
        }
    }

    async updateComment(commentId, userId, content) {
        try {
            const { exists, comment } = await this._getCommentById(commentId, 'user_id')

            if (!exists) {
                return {
                    success: false,
                    error: CommentService.ERRORS.COMMENT_NOT_FOUND
                }
            }

            const permissionCheck = this._checkCommentPermissions(comment, userId)
            if (!permissionCheck.hasPermission) {
                return {
                    success: false,
                    error: permissionCheck.error
                }
            }

            const { data: updatedComment, error } = await this.supabase
                .from('dish_comments')
                .update({
                    content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', commentId)
                .select(`
                    *,
                    profiles!user_id(full_name, avatar_url)
                `)
                .single()

            if (error) {
                return this._handleError('Comment update', error, CommentService.ERRORS.UPDATE_ERROR)
            }

            return this._handleSuccess({ comment: updatedComment }, CommentService.MESSAGES.COMMENT_UPDATED)
        } catch (error) {
            return this._handleError('Comment update', error)
        }
    }

    async deleteComment(commentId, userId, isAdmin = false) {
        try {
            const { exists, comment } = await this._getCommentById(commentId, 'user_id')

            if (!exists) {
                return {
                    success: false,
                    error: CommentService.ERRORS.COMMENT_NOT_FOUND
                }
            }

            const permissionCheck = this._checkCommentPermissions(comment, userId, isAdmin)
            if (!permissionCheck.hasPermission) {
                return {
                    success: false,
                    error: permissionCheck.error
                }
            }

            const { error } = await this.supabase
                .from('dish_comments')
                .update({
                    is_deleted: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', commentId)

            if (error) {
                return this._handleError('Comment deletion', error, CommentService.ERRORS.DELETE_ERROR)
            }

            return this._handleSuccess({}, CommentService.MESSAGES.COMMENT_DELETED)
        } catch (error) {
            return this._handleError('Comment deletion', error)
        }
    }

    async getAllCommentsForAdmin(filters = {}) {
        try {
            const { page = 1, limit = 20, status } = filters
            const offset = (page - 1) * limit

            let query = this.supabase
                .from('dish_comments')
                .select(`
                    *,
                    profiles:user_id(full_name, email, profile_tag),
                    dishes:dish_id(title, status)
                `, { count: 'exact' })

            if (status) {
                query = query.eq('status', status)
            }

            const { data: comments, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) {
                return this._handleError(
                    'Admin comments fetch',
                    error,
                    CommentService.ERRORS.DATABASE_ERROR,
                    CommentService.MESSAGES.FETCH_COMMENTS_ADMIN
                )
            }

            return this._handleSuccess({
                comments: comments || [],
                total: count || 0
            })
        } catch (error) {
            return this._handleError(
                'Admin comments fetch',
                error,
                CommentService.ERRORS.INTERNAL_ERROR,
                CommentService.MESSAGES.FETCH_COMMENTS_ADMIN
            )
        }
    }

    async getCommentDetailsForAdmin(commentId) {
        try {
            const { data: comment, error } = await this.supabase
                .from('dish_comments')
                .select(`
                    *,
                    profiles:user_id(full_name, email, profile_tag, created_at),
                    dishes:dish_id(title, status, user_id)
                `)
                .eq('id', commentId)
                .single()

            if (error) {
                return this._handleError(
                    'Admin comment details fetch',
                    error,
                    CommentService.ERRORS.COMMENT_NOT_FOUND,
                    CommentService.MESSAGES.FETCH_COMMENT_DETAILS
                )
            }

            return this._handleSuccess({ comment })
        } catch (error) {
            return this._handleError(
                'Admin comment details fetch',
                error,
                CommentService.ERRORS.INTERNAL_ERROR,
                CommentService.MESSAGES.FETCH_COMMENT_DETAILS
            )
        }
    }

    async deleteCommentByAdmin(commentId) {
        try {
            const { exists, comment } = await this._getCommentById(commentId)

            if (!exists) {
                return {
                    success: false,
                    error: CommentService.ERRORS.COMMENT_NOT_FOUND,
                    message: CommentService.MESSAGES.COMMENT_NOT_EXIST
                }
            }

            const { error } = await this.supabase
                .from('dish_comments')
                .update({
                    is_deleted: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', commentId)

            if (error) {
                return this._handleError('Comment deletion by admin', error, CommentService.ERRORS.DELETE_ERROR)
            }

            this.logger.info('Comment deleted by admin successfully', { commentId })
            return this._handleSuccess({}, CommentService.MESSAGES.COMMENT_DELETED)
        } catch (error) {
            return this._handleError(
                'Comment deletion by admin',
                error,
                CommentService.ERRORS.INTERNAL_ERROR,
                CommentService.ERRORS.DELETE_ERROR
            )
        }
    }

    async getCommentStats() {
        try {
            const { data: stats, error: rpcError } = await this.supabase
                .rpc('get_comment_stats')

            if (!rpcError && stats && stats.length > 0) {
                return this._handleSuccess({ stats: stats[0] })
            }

            const [totalResult, activeResult, removedResult] = await Promise.all([
                this.supabase.from('dish_comments').select('id', { count: 'exact', head: true }),
                this.supabase.from('dish_comments').select('id', { count: 'exact', head: true }).eq('is_deleted', 'false'),
                this.supabase.from('dish_comments').select('id', { count: 'exact', head: true }).eq('is_deleted', 'true'),

            ])

            const fallbackStats = {
                total: totalResult.count || 0,
                active: activeResult.count || 0,
                deleted: removedResult.count || 0,
            }

            return this._handleSuccess({ stats: fallbackStats })
        } catch (error) {
            return this._handleError(
                'Comment stats fetch',
                error,
                CommentService.ERRORS.INTERNAL_ERROR,
                CommentService.MESSAGES.FETCH_STATS
            )
        }
    }
}

export default CommentService
