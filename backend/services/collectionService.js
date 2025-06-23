export class CollectionService {
    constructor(supabase, logger) {
        this.supabase = supabase
        this.logger = logger
    }

    static ERRORS = {
        COLLECTION_NOT_FOUND: 'Collection not found',
        ACCESS_DENIED: 'Access denied',
        DISH_ALREADY_IN_COLLECTION: 'Dish already in collection',
        INTERNAL_ERROR: 'Internal server error',
        CREATE_ERROR: 'Unable to create collection',
        FETCH_ERROR: 'Unable to fetch collections',
        ADD_ERROR: 'Unable to add dish to collection',
        REMOVE_ERROR: 'Unable to remove dish from collection'
    }

    static MESSAGES = {
        COLLECTION_CREATED: 'Collection created successfully',
        DISH_ADDED: 'Dish added to collection successfully',
        DISH_REMOVED: 'Dish removed from collection successfully'
    }

    static SYSTEM_COLLECTIONS = [
        {
            name: 'Мої страви',
            description: 'Ваші створені страви',
            system_type: 'my_dishes'
        },
        {
            name: 'Улюблені',
            description: 'Збережені страви інших користувачів',
            system_type: 'liked'
        },
        {
            name: 'Опубліковані',
            description: 'Ваші опубліковані страви',
            system_type: 'published'
        },
        {
            name: 'Приватні',
            description: 'Ваші приватні страви',
            system_type: 'private'
        }
    ]

    _handleError(operation, error, customMessage = null) {
        this.logger.error(`${operation} error`, { error: error.message })
        return {
            success: false,
            error: customMessage || CollectionService.ERRORS.INTERNAL_ERROR,
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

    async _getCollectionById(collectionId) {
        const { data: collection, error } = await this.supabase
            .from('dish_collections')
            .select('*')
            .eq('id', collectionId)
            .single()

        if (error || !collection) {
            return { exists: false, collection: null }
        }

        return { exists: true, collection }
    }

    async _checkCollectionAccess(collectionId, userId) {
        const { exists, collection } = await this._getCollectionById(collectionId)

        if (!exists) {
            return {
                hasAccess: false,
                error: CollectionService.ERRORS.COLLECTION_NOT_FOUND
            }
        }

        if (collection.user_id !== userId && !collection.is_public) {
            return {
                hasAccess: false,
                error: CollectionService.ERRORS.ACCESS_DENIED
            }
        }

        return { hasAccess: true, collection }
    }

    async _getSystemCollectionByType(userId, systemType) {
        const { data: collection, error } = await this.supabase
            .from('dish_collections')
            .select('id')
            .eq('user_id', userId)
            .eq('system_type', systemType)
            .single()

        if (error) {
            return { exists: false, collection: null }
        }

        return { exists: true, collection }
    }

    async _ensureSystemCollections(userId) {
        const { data: systemCollections, error } = await this.supabase
            .from('dish_collections')
            .select('id, system_type')
            .eq('user_id', userId)
            .eq('collection_type', 'system')

        if (error) {
            throw error
        }

        if (!systemCollections || systemCollections.length === 0) {
            const createResult = await this.createSystemCollections(userId)
            if (!createResult.success) {
                throw new Error(createResult.error)
            }
            return createResult.collections
        }

        return systemCollections
    }

    _shouldAddToSystemCollection(systemType, dishStatus) {
        switch (systemType) {
            case 'my_dishes':
                return true
            case 'published':
                return dishStatus === 'approved'
            case 'private':
                return ['draft', 'pending', 'rejected'].includes(dishStatus)
            default:
                return false
        }
    }

    async createCollection(userId, collectionData) {
        try {
            const { name, description, is_public = false } = collectionData

            const { data: collection, error } = await this.supabase
                .from('dish_collections')
                .insert({
                    user_id: userId,
                    name,
                    description,
                    collection_type: 'custom',
                    is_public
                })
                .select()
                .single()

            if (error) {
                return this._handleError('Collection creation', error, CollectionService.ERRORS.CREATE_ERROR)
            }

            return this._handleSuccess({ collection }, CollectionService.MESSAGES.COLLECTION_CREATED)
        } catch (error) {
            return this._handleError('Collection creation', error)
        }
    }

    async createSystemCollections(userId) {
        try {
            const collectionsToCreate = CollectionService.SYSTEM_COLLECTIONS.map(collection => ({
                user_id: userId,
                name: collection.name,
                description: collection.description,
                collection_type: 'system',
                system_type: collection.system_type,
                is_public: false
            }))

            const { data: newCollections, error } = await this.supabase
                .from('dish_collections')
                .insert(collectionsToCreate)
                .select()

            if (error) {
                return this._handleError('System collections creation', error)
            }

            return this._handleSuccess({ collections: newCollections })
        } catch (error) {
            return this._handleError('System collections creation', error)
        }
    }

    async getUserCollections(userId) {
        try {
            const { data: collections, error } = await this.supabase
                .from('dish_collections')
                .select(`
                    *,
                    dish_collection_items(
                        dish_id,
                        user_id,
                        added_at,
                        dishes(
                            id,
                            title,
                            main_image_url,
                            status
                        )
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) {
                return this._handleError('Collections fetch', error, CollectionService.ERRORS.FETCH_ERROR)
            }

            return this._handleSuccess({ collections: collections || [] })
        } catch (error) {
            return this._handleError('Collections fetch', error)
        }
    }

    async addDishToCollection(userId, collectionId, dishId) {
        try {
            const accessCheck = await this._checkCollectionAccess(collectionId, userId)
            if (!accessCheck.hasAccess) {
                return {
                    success: false,
                    error: accessCheck.error
                }
            }

            const { data: item, error } = await this.supabase
                .from('dish_collection_items')
                .insert({
                    collection_id: collectionId,
                    dish_id: dishId,
                    user_id: userId
                })
                .select()
                .single()

            if (error) {
                if (error.code === '23505') {
                    return {
                        success: false,
                        error: CollectionService.ERRORS.DISH_ALREADY_IN_COLLECTION
                    }
                }
                return this._handleError('Add dish to collection', error, CollectionService.ERRORS.ADD_ERROR)
            }

            return this._handleSuccess({ item }, CollectionService.MESSAGES.DISH_ADDED)
        } catch (error) {
            return this._handleError('Add dish to collection', error)
        }
    }

    async removeDishFromCollection(userId, collectionId, dishId) {
        try {
            const accessCheck = await this._checkCollectionAccess(collectionId, userId)
            if (!accessCheck.hasAccess) {
                return {
                    success: false,
                    error: accessCheck.error
                }
            }

            const { error } = await this.supabase
                .from('dish_collection_items')
                .delete()
                .eq('collection_id', collectionId)
                .eq('dish_id', dishId)
                .eq('user_id', userId)

            if (error) {
                return this._handleError('Remove dish from collection', error, CollectionService.ERRORS.REMOVE_ERROR)
            }

            return this._handleSuccess({}, CollectionService.MESSAGES.DISH_REMOVED)
        } catch (error) {
            return this._handleError('Remove dish from collection', error)
        }
    }

    async addDishToSystemCollections(dishId, userId, dishStatus) {
        try {
            const systemCollections = await this._ensureSystemCollections(userId)

            const itemsToAdd = systemCollections
                .filter(collection => this._shouldAddToSystemCollection(collection.system_type, dishStatus))
                .map(collection => ({
                    collection_id: collection.id,
                    dish_id: dishId,
                    user_id: userId
                }))

            if (itemsToAdd.length > 0) {
                const { error } = await this.supabase
                    .from('dish_collection_items')
                    .insert(itemsToAdd)

                if (error) {
                    return this._handleError('Add dish to system collections', error)
                }
            }

            return this._handleSuccess()
        } catch (error) {
            return this._handleError('Add dish to system collections', error)
        }
    }

    async updateDishInSystemCollections(dishId, userId, oldStatus, newStatus) {
        try {
            const { data: systemCollections } = await this.supabase
                .from('dish_collections')
                .select('id')
                .eq('user_id', userId)
                .eq('collection_type', 'system')

            if (systemCollections && systemCollections.length > 0) {
                const collectionIds = systemCollections.map(c => c.id)
                await this.supabase
                    .from('dish_collection_items')
                    .delete()
                    .eq('dish_id', dishId)
                    .eq('user_id', userId)
                    .in('collection_id', collectionIds)
            }

            return await this.addDishToSystemCollections(dishId, userId, newStatus)
        } catch (error) {
            return this._handleError('Update dish in system collections', error)
        }
    }

    async addLikedDishToCollection(dishId, userId, dishOwnerId) {
        try {
            if (userId === dishOwnerId) {
                return this._handleSuccess()
            }

            const { exists, collection } = await this._getSystemCollectionByType(userId, 'liked')
            if (!exists) {
                return this._handleError('Add liked dish', new Error('Liked collection not found'))
            }

            return await this.addDishToCollection(userId, collection.id, dishId)
        } catch (error) {
            return this._handleError('Add liked dish to collection', error)
        }
    }

    async removeLikedDishFromCollection(dishId, userId) {
        try {
            const { exists, collection } = await this._getSystemCollectionByType(userId, 'liked')
            if (!exists) {
                return this._handleSuccess()
            }

            return await this.removeDishFromCollection(userId, collection.id, dishId)
        } catch (error) {
            return this._handleError('Remove liked dish from collection', error)
        }
    }

    async getDishesByType(userId, type) {
        try {
            const { exists, collection } = await this._getSystemCollectionByType(userId, type)
            if (!exists) {
                return {
                    success: false,
                    error: CollectionService.ERRORS.COLLECTION_NOT_FOUND,
                    message: `System collection '${type}' not found for user`
                }
            }

            const { data: collectionItems, error } = await this.supabase
                .from('dish_collection_items')
                .select(`
                    *,
                    dishes(
                        *,
                        dish_category_relations(
                            dish_categories(name)
                        )
                    ),
                    profiles(full_name, profile_tag),
                    dish_ratings(rating_type)
                `)
                .eq('collection_id', collection.id)
                .order('added_at', { ascending: false })

            if (error) {
                return this._handleError('Get dishes by type', error, CollectionService.ERRORS.FETCH_ERROR)
            }

            const dishes = collectionItems?.map(item => {
                const dish = item.dishes
                return {
                    ...dish,
                    categories: dish.dish_category_relations?.map(rel => rel.dish_categories) || [],
                    added_to_collection_at: item.added_at
                }
            }) || []

            return this._handleSuccess({ dishes })
        } catch (error) {
            return this._handleError('Get dishes by type', error)
        }
    }
}

export default CollectionService
