export class CategoryService {
    constructor(supabase, logger) {
        this.supabase = supabase
        this.logger = logger
    }

    static ERRORS = {
        CATEGORY_NOT_FOUND: 'Категорію не знайдено',
        CATEGORY_EXISTS: 'Категорія вже існує',
        CATEGORY_IN_USE: 'Категорія використовується',
        INTERNAL_ERROR: 'Внутрішня помилка сервера',
        FETCH_ERROR: 'Не вдається отримати категорію',
        CREATE_ERROR: 'Не вдалося створити категорію',
        UPDATE_ERROR: 'Не вдалося оновити категорію',
        DELETE_ERROR: 'Неможливо видалити категорію',
        SEARCH_ERROR: 'Неможливо здійснити пошук за категоріями'
    }

    static MESSAGES = {
        CATEGORY_NOT_FOUND: 'Зазначеної категорії не існує',
        CATEGORY_EXISTS: 'Категорія з такою назвою вже існує',
        CATEGORY_CREATED: 'Категорію створено успішно',
        CATEGORY_UPDATED: 'Категорію успішно оновлено',
        CATEGORY_DELETED: 'Категорію успішно видалено',
        CATEGORY_IN_USE: 'Неможливо видалити категорію, оскільки вона пов`язана з однією або кількома стравами'
    }

    _handleError(operation, error, customMessage = null) {
        this.logger.error(`${operation} error`, { error: error.message })
        return {
            success: false,
            error: customMessage || CategoryService.ERRORS.INTERNAL_ERROR,
            message: error.message || customMessage || 'An unexpected error occurred'
        }
    }

    _handleSuccess(data = {}, message = null) {
        return {
            success: true,
            ...data,
            ...(message && { message })
        }
    }

    async _checkCategoryExists(categoryId) {
        const { data: category, error } = await this.supabase
            .from('dish_categories')
            .select('*')
            .eq('id', categoryId)
            .single()

        if (error && error.code === 'PGRST116') {
            return { exists: false, category: null }
        }

        if (error) {
            throw error
        }

        return { exists: true, category }
    }

    async _checkCategoryNameExists(name, excludeId = null) {
        let query = this.supabase
            .from('dish_categories')
            .select('id')
            .eq('name', name)

        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { data, error } = await query.limit(1)

        if (error) {
            throw error
        }

        return data && data.length > 0
    }

    async getAllCategories() {
        try {
            const { data: categories, error } = await this.supabase
                .from('dish_categories')
                .select('*')
                .order('name')

            if (error) {
                return this._handleError('Categories fetch', error, CategoryService.ERRORS.FETCH_ERROR)
            }

            return this._handleSuccess({ categories: categories || [] })
        } catch (error) {
            return this._handleError('Categories fetch', error)
        }
    }

    async createCategory(name, description) {
        try {
            const nameExists = await this._checkCategoryNameExists(name)
            if (nameExists) {
                return {
                    success: false,
                    error: CategoryService.ERRORS.CATEGORY_EXISTS,
                    message: CategoryService.MESSAGES.CATEGORY_EXISTS
                }
            }

            const { data: category, error } = await this.supabase
                .from('dish_categories')
                .insert([{ name, description }])
                .select()
                .single()

            if (error) {
                return this._handleError('Category creation', error, CategoryService.ERRORS.CREATE_ERROR)
            }

            this.logger.info('Category created', { categoryId: category.id, name })
            return this._handleSuccess({ category }, CategoryService.MESSAGES.CATEGORY_CREATED)
        } catch (error) {
            return this._handleError('Category creation', error)
        }
    }

    async updateCategory(categoryId, name, description) {
        try {
            const { exists } = await this._checkCategoryExists(categoryId)
            if (!exists) {
                return {
                    success: false,
                    error: CategoryService.ERRORS.CATEGORY_NOT_FOUND,
                    message: CategoryService.MESSAGES.CATEGORY_NOT_FOUND
                }
            }

            const nameExists = await this._checkCategoryNameExists(name, categoryId)
            if (nameExists) {
                return {
                    success: false,
                    error: CategoryService.ERRORS.CATEGORY_EXISTS,
                    message: CategoryService.MESSAGES.CATEGORY_EXISTS
                }
            }

            const { data: category, error } = await this.supabase
                .from('dish_categories')
                .update({ name, description })
                .eq('id', categoryId)
                .select()
                .single()

            if (error) {
                return this._handleError('Category update', error, CategoryService.ERRORS.UPDATE_ERROR)
            }

            this.logger.info('Category updated', { categoryId, name })
            return this._handleSuccess({ category }, CategoryService.MESSAGES.CATEGORY_UPDATED)
        } catch (error) {
            return this._handleError('Category update', error)
        }
    }

    async deleteCategory(categoryId) {
        try {
            const { exists } = await this._checkCategoryExists(categoryId)
            if (!exists) {
                return {
                    success: false,
                    error: CategoryService.ERRORS.CATEGORY_NOT_FOUND,
                    message: CategoryService.MESSAGES.CATEGORY_NOT_FOUND
                }
            }

            // Check if the category is associated with any dishes
            const { count, error: countError } = await this.supabase
                .from('dish_category_relations')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', categoryId)

            if (countError) {
                return this._handleError('Category relations check', countError, CategoryService.ERRORS.DELETE_ERROR)
            }

            // If the category is in use, prevent deletion
            if (count && count > 0) {
                return {
                    success: false,
                    error: CategoryService.ERRORS.CATEGORY_IN_USE,
                    message: CategoryService.MESSAGES.CATEGORY_IN_USE
                }
            }

            // First, delete all category relations (associations with dishes)
            const { error: relationsError } = await this.supabase
                .from('dish_category_relations')
                .delete()
                .eq('category_id', categoryId)

            if (relationsError) {
                return this._handleError('Category relations deletion', relationsError, CategoryService.ERRORS.DELETE_ERROR)
            }

            // Then delete the category itself
            const { error } = await this.supabase
                .from('dish_categories')
                .delete()
                .eq('id', categoryId)

            if (error) {
                return this._handleError('Category deletion', error, CategoryService.ERRORS.DELETE_ERROR)
            }

            this.logger.info('Category deleted', { categoryId })
            return this._handleSuccess({}, CategoryService.MESSAGES.CATEGORY_DELETED)
        } catch (error) {
            return this._handleError('Category deletion', error)
        }
    }

    async getCategoryById(categoryId) {
        try {
            const { exists, category } = await this._checkCategoryExists(categoryId)
            if (!exists) {
                return {
                    success: false,
                    error: CategoryService.ERRORS.CATEGORY_NOT_FOUND,
                    message: CategoryService.MESSAGES.CATEGORY_NOT_FOUND
                }
            }

            return this._handleSuccess({ category })
        } catch (error) {
            return this._handleError('Category fetch', error)
        }
    }

    async searchCategories(query) {
        try {
            const { data: categories, error } = await this.supabase
                .from('dish_categories')
                .select('*')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .order('name')

            if (error) {
                return this._handleError('Category search', error, CategoryService.ERRORS.SEARCH_ERROR)
            }

            return this._handleSuccess({ categories: categories || [] })
        } catch (error) {
            return this._handleError('Category search', error)
        }
    }

    async getAllCategoriesForAdmin() {
        try {
            // Get all categories with dish counts using a proper join
            const { data: categories, error } = await this.supabase
                .from('dish_categories')
                .select(`
                    *,
                    dish_category_relations(count)
                `)
                .order('name')

            if (error) {
                return this._handleError('Admin categories fetch', error, CategoryService.ERRORS.FETCH_ERROR)
            }

            // Process categories to add dish counts
            const processedCategories = (categories || []).map(category => ({
                ...category,
                dishes_count: category.dish_category_relations?.length || 0
            }))

            // Remove the nested relation data
            processedCategories.forEach(category => {
                delete category.dish_category_relations
            })

            return this._handleSuccess({ 
                categories: processedCategories
            })

        } catch (error) {
            return this._handleError('Admin categories fetch', error)
        }
    }

    async getCategoryDetails(categoryId) {
        try {
            const { data: category, error } = await this.supabase
                .from('dish_categories')
                .select(`
                    *,
                    dish_category_relations(
                        dish_id,
                        dishes(
                            id,
                            name,
                            description,
                            image_url
                        )
                    )
                `)
                .eq('id', categoryId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return {
                        success: false,
                        error: CategoryService.ERRORS.CATEGORY_NOT_FOUND,
                        message: CategoryService.MESSAGES.CATEGORY_NOT_FOUND
                    }
                }
                return this._handleError('Category details fetch', error, CategoryService.ERRORS.FETCH_ERROR)
            }

            const categoryDetails = {
                ...category,
                dishes: category.dish_category_relations?.map(rel => rel.dishes) || [],
                dishes_count: category.dish_category_relations?.length || 0
            }

            delete categoryDetails.dish_category_relations

            return this._handleSuccess({ category: categoryDetails })
        } catch (error) {
            return this._handleError('Category details fetch', error)
        }
    }

    async getCategoryStats() {
        try {
            // Get total categories count
            const { count: totalCategories, error: categoriesError } = await this.supabase
                .from('dish_categories')
                .select('*', { count: 'exact', head: true })
            
            if (categoriesError) {
                return this._handleError('Category stats fetch', categoriesError)
            }
            
            // Get total dishes count across all categories
            const { count: totalDishes, error: dishesError } = await this.supabase
                .from('dish_category_relations')
                .select('*', { count: 'exact', head: true })
            
            if (dishesError) {
                return this._handleError('Category stats fetch', dishesError)
            }
            
            // Get categories with their dish counts
            const { data: categoriesWithCounts, error: countsError } = await this.supabase
                .from('dish_categories')
                .select(`
                    *,
                    dish_category_relations(count)
                `)
                .order('name')
            
            if (countsError) {
                return this._handleError('Category stats fetch', countsError)
            }
            
            // Process categories to add dish counts
            const processedCategories = (categoriesWithCounts || []).map(category => ({
                ...category,
                dishes_count: category.dish_category_relations?.length || 0
            }))
            
            // Remove the nested relation data
            processedCategories.forEach(category => {
                delete category.dish_category_relations
            })
            
            // Calculate empty categories
            const emptyCategories = processedCategories.filter(category => category.dishes_count === 0).length
            
            // Get most used categories (top 5)
            const mostUsedCategories = [...processedCategories]
                .sort((a, b) => (b.dishes_count || 0) - (a.dishes_count || 0))
                .slice(0, 5)
            
            // Get recently created categories (top 5)
            const recentCategories = [...processedCategories]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
            
            const stats = {
                totalCategories: totalCategories || 0,
                totalDishes: totalDishes || 0,
                emptyCategories,
                mostUsedCategories,
                recentCategories
            }
            
            return this._handleSuccess({ stats })
        } catch (error) {
            return this._handleError('Category stats fetch', error)
        }
    }
}