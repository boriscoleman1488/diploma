export class RatingService {
  constructor(supabase, logger) {
    this.supabase = supabase
    this.logger = logger
    this.collectionService = null

    // Константи
    this.RATING_VALUES = {
      LIKE: 1,
      NO_RATING: 0
    }



    this.DISH_STATUS = {
      PUBLISHED: 'published',
      DRAFT: 'draft',
      PENDING: 'pending',
      REJECTED: 'rejected'
    }

    this.ERRORS = {
      DISH_NOT_FOUND: 'Dish not found',
      RATING_NOT_FOUND: 'Rating not found',
      INTERNAL_ERROR: 'Internal server error',
      INVALID_RATING: 'Invalid rating value'
    }

    this.TIME_PERIODS = {
      WEEK: 7,
      MONTH: 30,
      YEAR: 365
    }
  }

  setCollectionService(collectionService) {
    this.collectionService = collectionService
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

  _validateIds(dishId, userId = null) {
    if (!dishId || typeof dishId !== 'string') {
      throw new Error('Valid dish ID is required')
    }
    if (userId !== null && (!userId || typeof userId !== 'string')) {
      throw new Error('Valid user ID is required')
    }
  }

  _validateRating(rating) {
    const validRatings = Object.values(this.RATING_VALUES)
    if (!validRatings.includes(rating)) {
      throw new Error(`Rating must be one of: ${validRatings.join(', ')}`)
    }
  }

  _validatePagination(page, limit) {
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
    return { page: pageNum, limit: limitNum }
  }

  async _checkDishExists(dishId) {
    const { data: dish, error } = await this.supabase
      .from('dishes')
      .select('id')
      .eq('id', dishId)
      .single()

    if (error || !dish) {
      throw new Error(this.ERRORS.DISH_NOT_FOUND)
    }
    return dish
  }

  _getDateByPeriod(period) {
    const date = new Date()
    switch (period) {
      case 'week':
        date.setDate(date.getDate() - this.TIME_PERIODS.WEEK)
        break
      case 'month':
        date.setDate(date.getDate() - this.TIME_PERIODS.MONTH)
        break
      case 'year':
        date.setDate(date.getDate() - this.TIME_PERIODS.YEAR)
        break
      default:
        return null
    }
    return date.toISOString()
  }

  async getDishRatingStats(dishId) {
    try {
      this._validateIds(dishId)

      const { data, error } = await this.supabase
        .from('dish_ratings')
        .select('rating_type')
        .eq('dish_id', dishId)

      if (error) {
        return this._handleError(error, 'Unable to get rating stats', { dishId })
      }

      const likes = data.filter(r => r.rating_type === this.RATING_VALUES.LIKE).length
      const total = data.length

      const stats = {
        likes,
        total,
        ratio: total > 0 ? (likes / total) : 0
      }

      this.logger.info('Rating stats retrieved', { dishId, stats })
      return this._handleSuccess({ stats })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId })
    }
  }

  async getDishRatings(dishId, page = 1, limit = 20, period = null) {
    try {
      this._validateIds(dishId)
      const { page: pageNum, limit: limitNum } = this._validatePagination(page, limit)
      const dateFilter = period ? this._getDateByPeriod(period) : null

      const query = this.supabase
        .from('dish_ratings')
        .select('*')
        .eq('dish_id', dishId)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * limitNum, pageNum * limitNum - 1)
      if (dateFilter) {
        query.gte('created_at', dateFilter)
      }
      const { data, error } = await query

      if (error) {
        return this._handleError(error, 'Unable to get dish ratings', { dishId })
      }

      return this._handleSuccess({ ratings: data })
    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId })
    }
  }

  async setRating(dishId, userId, rating) {
    try {
      this._validateIds(dishId, userId)
      this._validateRating(rating)

      await this._checkDishExists(dishId)

      if (rating === this.RATING_VALUES.NO_RATING) {
        // Видалити рейтинг якщо 0
        const { error } = await this.supabase
          .from('dish_ratings')
          .delete()
          .eq('dish_id', dishId)
          .eq('user_id', userId)

        if (error) {
          return this._handleError(error, 'Unable to remove rating', { dishId, userId })
        }

        return this._handleSuccess({ message: 'Rating removed' })
      } else {
        // Додати або оновити лайк
        const { data, error } = await this.supabase
          .from('dish_ratings')
          .upsert(
            {
              dish_id: dishId,
              user_id: userId,
              rating_type: rating
            },
            {
              onConflict: 'dish_id,user_id'
            }
          )
          .select()
          .single()

        if (error) {
          return this._handleError(error, 'Unable to set rating', { dishId, userId, rating })
        }

        this.logger.info('Rating set successfully', { dishId, userId, rating })
        return this._handleSuccess({ rating: data })
      }

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId, userId, rating })
    }
  }

  async getUserRating(dishId, userId) {
    try {
      this._validateIds(dishId, userId)

      const { data, error } = await this.supabase
        .from('dish_ratings')
        .select('rating_type')
        .eq('user_id', userId)
        .eq('dish_id', dishId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return this._handleError(error, 'Unable to get user rating', { dishId, userId })
      }

      const rating = data ? data.rating_type : this.RATING_VALUES.NO_RATING
      return this._handleSuccess({ rating })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId, userId })
    }
  }

  async removeLike(dishId, userId) {
    try {
      this._validateIds(dishId, userId)

      const { error } = await this.supabase
        .from('dish_ratings')
        .delete()
        .eq('dish_id', dishId)
        .eq('user_id', userId)

      if (error) {
        return this._handleError(error, 'Unable to remove like', { dishId, userId })
      }

      this.logger.info('Like removed successfully', { dishId, userId })
      return this._handleSuccess({ message: 'Like removed' })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId, userId })
    }
  }

  async removeRating(dishId, userId) {
    try {
      this._validateIds(dishId, userId)

      const { error } = await this.supabase
        .from('dish_ratings')
        .delete()
        .eq('dish_id', dishId)
        .eq('user_id', userId)

      if (error) {
        return this._handleError(error, 'Unable to remove rating', { dishId, userId })
      }

      this.logger.info('Rating removed successfully', { dishId, userId })
      return this._handleSuccess({}, 'Rating removed successfully')

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId, userId })
    }
  }

  async likeDish(userId, dishId) {
    try {
      this._validateIds(dishId, userId)

      await this._checkDishExists(dishId)

      const { data: rating, error: ratingError } = await this.supabase
        .from('dish_ratings')
        .upsert(
          {
            dish_id: dishId,
            user_id: userId,
            rating: this.RATING_VALUES.LIKE
          },
          {
            onConflict: 'dish_id,user_id'
          }
        )
        .select()
        .single()

      if (ratingError) {
        return this._handleError(ratingError, 'Unable to like dish', { dishId, userId })
      }

      // Додаємо до колекції улюблених
      if (this.collectionService) {
        try {
          await this.collectionService.addLikedDishToCollection(dishId, userId)
        } catch (collectionError) {
          this.logger.warn('Error adding to liked collection', {
            error: collectionError.message,
            dishId,
            userId
          })
        }
      }

      this.logger.info('Dish liked successfully', { dishId, userId })
      return this._handleSuccess({ rating }, 'Dish liked successfully')

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId, userId })
    }
  }

  async isLikedByUser(userId, dishId) {
    try {
      this._validateIds(dishId, userId)

      const { data, error } = await this.supabase
        .from('dish_ratings')
        .select('rating')
        .eq('user_id', userId)
        .eq('dish_id', dishId)
        .eq('rating', this.RATING_VALUES.LIKE)
        .single()

      if (error && error.code !== 'PGRST116') {
        return this._handleError(error, 'Unable to check like status', { dishId, userId })
      }

      return this._handleSuccess({ isLiked: !!data })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { dishId, userId })
    }
  }

  async getUserLikedDishes(userId, options = {}) {
    try {
      this._validateIds(null, userId)
      const { page, limit } = this._validatePagination(options.page, options.limit)
      const offset = (page - 1) * limit

      const { data: likedDishes, error, count } = await this.supabase
        .from('dish_ratings')
        .select(`
                    dish_id,
                    created_at,
                    dishes:dish_id(
                        id,
                        title,
                        description,
                        image_url,
                        status,
                        created_at,
                        profiles:user_id(id, full_name, profile_tag)
                    )
                `, { count: 'exact' })
        .eq('user_id', userId)
        .eq('rating', this.RATING_VALUES.LIKE)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return this._handleError(error, 'Unable to get liked dishes', { userId })
      }

      return this._handleSuccess({
        dishes: likedDishes || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
    }
  }

  async getTopLikedDishes(options = {}) {
    try {
      const { limit = 10, period = 'all' } = options
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)))

      let query = this.supabase
        .from('dish_ratings')
        .select(`
                    dish_id,
                    dishes:dish_id(
                        id,
                        title,
                        description,
                        image_url,
                        status,
                        created_at,
                        profiles:user_id(id, full_name, profile_tag)
                    )
                `)
        .eq('rating', this.RATING_VALUES.LIKE)
        .eq('dishes.status', this.DISH_STATUS.PUBLISHED)

      const periodDate = this._getDateByPeriod(period)
      if (periodDate) {
        query = query.gte('created_at', periodDate)
      }

      const { data: ratings, error } = await query

      if (error) {
        return this._handleError(error, 'Unable to get top liked dishes')
      }

      // Групуємо по стравах та рахуємо лайки
      const dishLikes = {}
      ratings.forEach(rating => {
        const dishId = rating.dish_id
        if (!dishLikes[dishId]) {
          dishLikes[dishId] = {
            dish: rating.dishes,
            likes: 0
          }
        }
        dishLikes[dishId].likes++
      })

      const topDishes = Object.values(dishLikes)
        .sort((a, b) => b.likes - a.likes)
        .slice(0, limitNum)
        .map(item => ({
          ...item.dish,
          likes_count: item.likes
        }))

      return this._handleSuccess({ dishes: topDishes })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR)
    }
  }

  async getUserRatingStats(userId) {
    try {
      this._validateIds(null, userId)

      const { data: ratings, error } = await this.supabase
        .from('dish_ratings')
        .select('rating_type')
        .eq('user_id', userId)

      if (error) {
        return this._handleError(error, 'Unable to get user rating stats', { userId })
      }

      const likes = ratings.filter(r => r.rating_type === this.RATING_VALUES.LIKE).length
      const dislikes = 0  // Завжди 0
      const total = ratings.length

      return this._handleSuccess({
        stats: {
          total,
          likes,
          dislikes,
          likeRatio: likes > 0 ? 1 : 0
        }
      })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { userId })
    }
  }

  // Админістративні методи
  async getAllRatingsForAdmin(options = {}) {
    try {
      const { page, limit } = this._validatePagination(options.page, options.limit)
      const { dishId, userId } = options
      const offset = (page - 1) * limit

      let query = this.supabase
        .from('dish_ratings')
        .select(`
                    *,
                    dishes:dish_id(id, title, status),
                    profiles:user_id(id, full_name, email)
                `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (dishId) {
        this._validateIds(dishId)
        query = query.eq('dish_id', dishId)
      }

      if (userId) {
        this._validateIds(null, userId)
        query = query.eq('user_id', userId)
      }

      const { data: ratings, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        return this._handleError(error, 'Unable to get ratings for admin')
      }

      return this._handleSuccess({
        ratings: ratings || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR)
    }
  }

  async getRatingDetailsForAdmin(ratingId) {
    try {
      if (!ratingId) {
        throw new Error('Rating ID is required')
      }

      const { data: rating, error } = await this.supabase
        .from('dish_ratings')
        .select(`
                    *,
                    dishes:dish_id(id, title, description, status),
                    profiles:user_id(id, full_name, email, profile_tag)
                `)
        .eq('id', ratingId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return this._handleError(new Error('Rating not found'), this.ERRORS.RATING_NOT_FOUND, { ratingId })
        }
        return this._handleError(error, 'Unable to get rating details', { ratingId })
      }

      return this._handleSuccess({ rating })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { ratingId })
    }
  }

  async deleteRatingByAdmin(ratingId) {
    try {
      if (!ratingId) {
        throw new Error('Rating ID is required')
      }

      const { error } = await this.supabase
        .from('dish_ratings')
        .delete()
        .eq('id', ratingId)

      if (error) {
        return this._handleError(error, 'Unable to delete rating', { ratingId })
      }

      this.logger.info('Rating deleted by admin', { ratingId })
      return this._handleSuccess({}, 'Rating deleted successfully')

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR, { ratingId })
    }
  }

  async getSystemRatingStats() {
    try {
      const { data: allRatings, error } = await this.supabase
        .from('dish_ratings')
        .select('rating_type, created_at')  // Змінено з 'rating' на 'rating_type'

      if (error) {
        return this._handleError(error, 'Unable to get system rating stats')
      }

      const likes = allRatings.filter(r => r.rating_type === this.RATING_VALUES.LIKE).length
      const dislikes = 0  // Завжди 0, оскільки дизлайків немає
      const totalRatings = allRatings.length

      // Статистика по періодах
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const weeklyRatings = allRatings.filter(r => new Date(r.created_at) >= weekAgo)
      const monthlyRatings = allRatings.filter(r => new Date(r.created_at) >= monthAgo)

      return this._handleSuccess({
        stats: {
          total: totalRatings,
          likes,
          dislikes,
          likeRatio: likes > 0 ? 1 : 0,
          weekly: {
            total: weeklyRatings.length,
            likes: weeklyRatings.filter(r => r.rating_type === this.RATING_VALUES.LIKE).length,
            dislikes: 0
          },
          monthly: {
            total: monthlyRatings.length,
            likes: monthlyRatings.filter(r => r.rating_type === this.RATING_VALUES.LIKE).length,
            dislikes: 0
          }
        }
      })

    } catch (error) {
      return this._handleError(error, this.ERRORS.INTERNAL_ERROR)
    }
  }
}

export default RatingService