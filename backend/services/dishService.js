export class DishService {
    constructor(supabase, logger, collectionService) {
        this.supabase = supabase
        this.logger = logger
        this.collectionService = collectionService

        this.DISH_STATUS = {
            DRAFT: 'draft',
            PENDING: 'pending',
            APPROVED: 'approved',
            REJECTED: 'rejected'
        }

        this.ERRORS = {
            DISH_NOT_FOUND: 'Dish not found',
            PERMISSION_DENIED: 'Permission denied',
            VALIDATION_ERROR: 'Validation error',
            DATABASE_ERROR: 'Database error'
        }
    }

    async _validateDishExists(dishId, userId = null) {
        const query = this.supabase
            .from('dishes')
            .select('*')
            .eq('id', dishId)

        if (userId) {
            query.eq('user_id', userId)
        }

        const { data: dish, error } = await query.single()

        if (error || !dish) {
            throw new Error(userId ? 'Dish not found or access denied' : 'Dish not found')
        }

        return dish
    }

    async _validateCategories(categoryIds) {
        if (!categoryIds || categoryIds.length === 0) return true

        const { data: categories, error } = await this.supabase
            .from('dish_categories')
            .select('id')
            .in('id', categoryIds)

        if (error) {
            throw new Error('Failed to validate categories')
        }

        if (categories.length !== categoryIds.length) {
            throw new Error('Some categories do not exist')
        }

        return true
    }

    async _createDishRelations(dishId, { category_ids, ingredients, steps }) {
        const operations = []

        if (category_ids && category_ids.length > 0) {
            const categoryRelations = category_ids.map(categoryId => ({
                dish_id: dishId,
                category_id: categoryId
            }))

            operations.push(
                this.supabase
                    .from('dish_category_relations')
                    .insert(categoryRelations)
            )
        }

        if (ingredients && ingredients.length > 0) {
            const ingredientsData = ingredients.map((ing, index) => ({
                dish_id: dishId,
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                edamam_food_id: ing.edamam_food_id,
                order_index: index
            }))

            operations.push(
                this.supabase
                    .from('dish_ingredients')
                    .insert(ingredientsData)
            )
        }

        if (steps && steps.length > 0) {
            const stepsData = steps.map((step, index) => ({
                dish_id: dishId,
                step_number: index + 1,
                description: step.description,
                image_url: step.image_url,
                duration_minutes: step.duration_minutes
            }))

            operations.push(
                this.supabase
                    .from('dish_steps')
                    .insert(stepsData)
            )
        }

        const results = await Promise.allSettled(operations)

        const errors = results
            .filter(result => result.status === 'rejected')
            .map(result => result.reason)

        if (errors.length > 0) {
            this.logger.error('Failed to create dish relations', { errors })
            throw new Error('Failed to create dish relations')
        }
    }

    async _deleteDishRelations(dishId) {
        const operations = [
            this.supabase.from('dish_ingredients').delete().eq('dish_id', dishId),
            this.supabase.from('dish_steps').delete().eq('dish_id', dishId),
            this.supabase.from('dish_category_relations').delete().eq('dish_id', dishId)
        ]

        await Promise.all(operations)
    }

    _handleError(error, context, defaultMessage = 'Internal server error') {
        this.logger.error(context, { error: error.message })
        return {
            success: false,
            error: defaultMessage,
            message: error.message
        }
    }

    _handleSuccess(message, data = {}) {
        return {
            success: true,
            message,
            ...data
        }
    }

    async getDishes() {
        try {
            const { data: dishes, error } = await this.supabase
                .from('dishes')
                .select(`
                    *,
                    profiles:user_id(full_name, email, profile_tag),
                    dish_category_relations(
                        dish_categories(id, name)
                    ),
                    dish_ratings(rating_type),
                    dish_comments(id)
                `)
                .eq('status', this.DISH_STATUS.APPROVED)
                .order('created_at', { ascending: false })

            if (error) {
                this.logger.error('Dishes fetch error', { error: error.message })
                return {
                    success: false,
                    error: 'Database error',
                    message: 'Unable to fetch dishes'
                }
            }

            const processedDishes = (dishes || []).map(dish => ({
                ...dish,
                categories: dish.dish_category_relations?.map(rel => rel.dish_categories) || [],
                ratings: dish.dish_ratings || [],
                comments_count: dish.dish_comments?.length || 0
            }))

            processedDishes.forEach(dish => {
                delete dish.dish_category_relations
                delete dish.dish_ratings
                delete dish.dish_comments
            })

            return {
                success: true,
                dishes: processedDishes,
                total: processedDishes.length
            }
        } catch (error) {
            this.logger.error('Dishes fetch error', { error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to fetch dishes'
            }
        }
    }

    async createDish(userId, dishData) {
        try {
            const { title, description, category_ids, servings, ingredients, steps, main_image_url } = dishData

            await this._validateCategories(category_ids)

            const { data: dish, error: dishError } = await this.supabase
                .from('dishes')
                .insert({
                    user_id: userId,
                    title,
                    description,
                    servings,
                    main_image_url,
                    status: this.DISH_STATUS.DRAFT
                })
                .select()
                .single()

            if (dishError) {
                throw new Error(dishError.message)
            }

            await this._createDishRelations(dish.id, { category_ids, ingredients, steps })

            if (this.collectionService) {
                await this.collectionService.addDishToSystemCollections(
                    dish.id,
                    userId,
                    dish.status
                )
            }

            this.logger.info('Dish created successfully', {
                dishId: dish.id,
                userId,
                status: dish.status
            })

            return this._handleSuccess(
                'Dish saved as draft in your private collection',
                {
                    dish: {
                        id: dish.id,
                        title: dish.title,
                        status: dish.status
                    }
                }
            )
        } catch (error) {
            return this._handleError(error, 'Dish creation error', 'Unable to create dish')
        }
    }

    async updateDish(dishId, userId, dishData) {
        try {
            await this._validateDishExists(dishId, userId)

            const { title, description, category_ids, servings, ingredients, steps, main_image_url } = dishData

            await this._validateCategories(category_ids)

            const { data: dish, error: dishError } = await this.supabase
                .from('dishes')
                .update({
                    title,
                    description,
                    servings,
                    main_image_url,
                    status: this.DISH_STATUS.PENDING,
                    updated_at: new Date().toISOString()
                })
                .eq('id', dishId)
                .select()
                .single()

            if (dishError) {
                throw new Error(dishError.message)
            }

            await this._deleteDishRelations(dishId)
            await this._createDishRelations(dishId, { category_ids, ingredients, steps })

            this.logger.info('Dish updated successfully', { dishId, userId })

            return this._handleSuccess('Dish updated successfully', { dish })
        } catch (error) {
            return this._handleError(error, 'Dish update error', 'Unable to update dish')
        }
    }

    async updateDishStatus(dishId, userId, action) {
        try {
            const { data: existingDish, error: fetchError } = await this.supabase
                .from('dishes')
                .select('*')
                .eq('id', dishId)
                .eq('user_id', userId)
                .single()

            if (fetchError || !existingDish) {
                return {
                    success: false,
                    error: 'Dish not found',
                    message: 'The specified dish does not exist or you do not have permission to edit it'
                }
            }

            let newStatus
            let message
            const oldStatus = existingDish.status

            switch (action) {
                case 'submit_for_review':
                    newStatus = 'pending'
                    message = 'Dish submitted for moderation'
                    break
                case 'make_private':
                    newStatus = 'draft'
                    message = 'Dish moved to private collection'
                    break
                default:
                    return {
                        success: false,
                        error: 'Invalid action',
                        message: 'Action must be "submit_for_review" or "make_private"'
                    }
            }

            const { data: dish, error: updateError } = await this.supabase
                .from('dishes')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', dishId)
                .select()
                .single()

            if (updateError) {
                this.logger.error('Dish status update failed', { error: updateError.message })
                return {
                    success: false,
                    error: 'Unable to update dish status',
                    message: updateError.message
                }
            }

            if (this.collectionService) {
                await this.collectionService.updateDishInSystemCollections(
                    dishId,
                    userId,
                    oldStatus,
                    newStatus
                )
            }

            this.logger.info('Dish status updated successfully', {
                dishId,
                userId,
                action,
                newStatus
            })

            return {
                success: true,
                message,
                dish
            }
        } catch (error) {
            this.logger.error('Dish status update error', { error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to update dish status'
            }
        }
    }

    async deleteDish(dishId, userId) {
        try {
            const { data: existingDish, error: fetchError } = await this.supabase
                .from('dishes')
                .select('*')
                .eq('id', dishId)
                .eq('user_id', userId)
                .single()

            if (fetchError || !existingDish) {
                return {
                    success: false,
                    error: 'Dish not found',
                    message: 'The specified dish does not exist or you do not have permission to delete it'
                }
            }

            await this.supabase
                .from('dish_ingredients')
                .delete()
                .eq('dish_id', dishId)

            await this.supabase
                .from('dish_steps')
                .delete()
                .eq('dish_id', dishId)

            await this.supabase
                .from('dish_category_relations')
                .delete()
                .eq('dish_id', dishId)

            const { error: deleteError } = await this.supabase
                .from('dishes')
                .delete()
                .eq('id', dishId)

            if (deleteError) {
                this.logger.error('Dish deletion failed', { error: deleteError.message })
                return {
                    success: false,
                    error: 'Unable to delete dish',
                    message: deleteError.message
                }
            }

            this.logger.info('Dish deleted successfully', {
                dishId,
                userId
            })

            return {
                success: true,
                message: 'Dish deleted successfully'
            }
        } catch (error) {
            this.logger.error('Dish deletion error', { error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to delete dish'
            }
        }
    }

    async getAllDishesForAdmin() {
        try {
            const { data: dishes, error } = await this.supabase
                .from('dishes')
                .select(`
                *,
                profiles:user_id(full_name, email, profile_tag),
                dish_category_relations(
                    dish_categories(id, name)
                ),
                dish_ratings(rating_type),
                dish_comments(id)
            `)
                .in('status', ['pending', 'approved', 'rejected'])
                .order('created_at', { ascending: false })

            if (error) {
                this.logger.error('Admin dishes fetch error', { error: error.message })
                return {
                    success: false,
                    error: 'Database error',
                    message: 'Unable to fetch dishes for admin'
                }
            }

            const processedDishes = (dishes || []).map(dish => ({
                ...dish,
                categories: dish.dish_category_relations?.map(rel => rel.dish_categories) || [],
                ratings: dish.dish_ratings || [],
                comments_count: dish.dish_comments?.length || 0
            }))

            processedDishes.forEach(dish => {
                delete dish.dish_category_relations
                delete dish.dish_ratings
                delete dish.dish_comments
            })

            return {
                success: true,
                dishes: processedDishes,
                total: processedDishes.length
            }
        } catch (error) {
            this.logger.error('Admin dishes fetch error', { error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to fetch dishes for admin'
            }
        }
    }

    async getDishDetailsForAdmin(dishId) {
        try {
            const { data: dish, error } = await this.supabase
                .from('dishes')
                .select(`
                *,
                profiles:user_id(username, email, created_at),
                dish_category_relations(
                    dish_categories(id, name)
                ),
                dish_ratings(rating, profiles(username)),
                dish_comments(comment, created_at, profiles(username))
            `)
                .eq('id', dishId)
                .single()

            if (error) {
                this.logger.error('Admin dish details fetch error', { error: error.message })
                return {
                    success: false,
                    error: 'Dish not found',
                    message: 'Unable to fetch dish details'
                }
            }

            const processedDish = {
                ...dish,
                categories: dish.dish_category_relations?.map(rel => rel.dish_categories) || [],
                ratings: dish.dish_ratings || [],
                comments: dish.dish_comments || []
            }

            delete processedDish.dish_category_relations
            delete processedDish.dish_ratings
            delete processedDish.dish_comments

            return {
                success: true,
                dish: processedDish
            }
        } catch (error) {
            this.logger.error('Admin dish details fetch error', { error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to fetch dish details'
            }
        }
    }

    async moderateDish(dishId, status, rejectionReason = null) {
        try {
            const existingDish = await this._validateDishExists(dishId)
            
            if (!['approved', 'rejected'].includes(status)) {
                return {
                    success: false,
                    error: 'Invalid status',
                    message: 'Status must be "approved" or "rejected"'
                }
            }
            
            const updateData = {
                status,
                moderated_at: new Date().toISOString()
            }
            
            if (status === 'rejected' && rejectionReason) {
                updateData.rejection_reason = rejectionReason
            }
            
            const { data: dish, error } = await this.supabase
                .from('dishes')
                .update(updateData)
                .eq('id', dishId)
                .select()
                .single()
                
            if (error) {
                throw new Error(error.message)
            }
            
            this.logger.info('Dish moderated successfully', { dishId, status })
            
            return this._handleSuccess(`Dish ${status} successfully`, { dish })
        } catch (error) {
            return this._handleError(error, 'Dish moderation error', 'Unable to moderate dish')
        }
    }

    async deleteDishByAdmin(dishId) {
        try {
            const { data: dish, error: fetchError } = await this.supabase
                .from('dishes')
                .select('id, title')
                .eq('id', dishId)
                .single()

            if (fetchError || !dish) {
                this.logger.error('Dish not found for admin deletion', { dishId, error: fetchError?.message })
                return {
                    success: false,
                    error: 'Dish not found',
                    message: 'The dish you are trying to delete does not exist'
                }
            }

            const { error: deleteError } = await this.supabase
                .from('dishes')
                .delete()
                .eq('id', dishId)

            if (deleteError) {
                this.logger.error('Admin dish deletion error', { dishId, error: deleteError.message })
                return {
                    success: false,
                    error: 'Database error',
                    message: 'Unable to delete dish'
                }
            }

            this.logger.info('Dish deleted by admin', { dishId, dishTitle: dish.title })
            return {
                success: true,
                message: 'Dish deleted successfully by admin'
            }
        } catch (error) {
            this.logger.error('Admin dish deletion error', { dishId, error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to delete dish'
            }
        }
    }

    async getDishStats() {
        try {
            const { data: dishes, error } = await this.supabase
                .from('dishes')
                .select('status')

            if (error) {
                this.logger.error('Dish stats fetch error', { error: error.message })
                return {
                    success: false,
                    error: 'Database error',
                    message: 'Unable to fetch dish statistics'
                }
            }

            const total = dishes.length
            const approved = dishes.filter(d => d.status === 'approved').length
            const pending = dishes.filter(d => d.status === 'pending').length
            const rejected = dishes.filter(d => d.status === 'rejected').length

            return {
                success: true,
                stats: {
                    total,
                    approved,
                    pending,
                    rejected
                }
            }
        } catch (error) {
            this.logger.error('Dish stats fetch error', { error: error.message })
            return {
                success: false,
                error: 'Internal server error',
                message: 'Unable to fetch dish statistics'
            }
        }
    }
}