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
        REMOVE_ERROR: 'Unable to remove dish from collection',
        SYSTEM_COLLECTION: 'Cannot modify system collection'
    }

    static MESSAGES = {
        COLLECTION_CREATED: 'Collection created successfully',
        COLLECTION_UPDATED: 'Collection updated successfully',
        COLLECTION_DELETED: 'Collection deleted successfully',
        DISH_ADDED: 'Dish added to collection successfully',
        DISH_REMOVED: 'Dish removed from collection successfully'
    }

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
            const { name, description } = collectionData

            const { data: collection, error } = await this.supabase
                .from('dish_collections')
                .insert({
                    user_id: userId,
                    name,
                    description,
                    collection_type: 'custom',
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

    async updateCollection(userId, collectionId, collectionData) {
        try {
            // Check if collection exists and user has access
            const { exists, collection } = await this._getCollectionById(collectionId)
            
            if (!exists) {
                return {
                    success: false,
                    error: CollectionService.ERRORS.COLLECTION_NOT_FOUND,
                    message: 'The specified collection does not exist'
                }
            }
            
            // Check if user owns the collection
            if (collection.user_id !== userId) {
                return {
                    success: false,
                    error: CollectionService.ERRORS.ACCESS_DENIED,
                    message: 'You do not have permission to update this collection'
                }
            }
            
            // Check if it's a system collection
            if (collection.collection_type === 'system') {
                return {
                    success: false,
                    error: CollectionService.ERRORS.SYSTEM_COLLECTION,
                    message: 'System collections cannot be modified'
                }
            }
            
            // Update the collection
            // В методі createCollection видалити:
            // const { name, description, is_public = false } = collectionData
            // is_public
            
            // В методі updateCollection видалити:
            // const { name, description, is_public } = collectionData
            // if (is_public !== undefined) updateData.is_public = is_public
            const updateData = {}
            
            if (name !== undefined) updateData.name = name
            if (description !== undefined) updateData.description = descriptionc
            
            const { data: updatedCollection, error } = await this.supabase
                .from('dish_collections')
                .update(updateData)
                .eq('id', collectionId)
                .select()
                .single()
                
            if (error) {
                return this._handleError('Collection update', error, 'Unable to update collection')
            }
            
            return this._handleSuccess(
                { collection: updatedCollection },
                CollectionService.MESSAGES.COLLECTION_UPDATED
            )
        } catch (error) {
            return this._handleError('Collection update', error)
        }
    }

    async createSystemCollections(userId) {
        try {
            const collectionsToCreate = CollectionService.SYSTEM_COLLECTIONS.map(collection => ({
                user_id: userId,
                name: collection.name,
                description: collection.description,
                collection_type: collection.system_type,
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

    async getCollectionWithDishes(userId, collectionId) {
        try {
            // Check if collection exists and user has access
            const accessCheck = await this._checkCollectionAccess(collectionId, userId)
            if (!accessCheck.hasAccess) {
                return {
                    success: false,
                    error: accessCheck.error,
                    message: accessCheck.error === CollectionService.ERRORS.COLLECTION_NOT_FOUND
                        ? 'The specified collection does not exist'
                        : 'You do not have permission to view this collection'
                }
            }

            const collection = accessCheck.collection

            // Get dishes in the collection
            const { data: collectionItems, error: itemsError } = await this.supabase
                .from('dish_collection_items')
                .select(`
                    dish_id,
                    added_at,
                    dishes(
                        *,
                        profiles(
                            id,
                            full_name,
                            email,
                            profile_tag,
                            avatar_url
                        ),
                        dish_category_relations(
                            dish_categories(
                                id,
                                name
                            )
                        ),
                        dish_ratings(
                            rating_type
                        ),
                        dish_comments(id)
                    )
                `)
                .eq('collection_id', collectionId)
                .order('added_at', { ascending: false })

            if (itemsError) {
                return this._handleError('Collection dishes fetch', itemsError, 'Unable to fetch dishes in collection')
            }

            // Process dishes to include added_at date and format them properly
            const dishes = collectionItems?.map(item => {
                const dish = item.dishes
                return {
                    ...dish,
                    added_to_collection_at: item.added_at,
                    categories: dish.dish_category_relations?.map(rel => rel.dish_categories) || [],
                    ratings: dish.dish_ratings || [],
                    comments_count: dish.dish_comments?.length || 0
                }
            }) || []

            // Clean up nested properties
            dishes.forEach(dish => {
                delete dish.dish_category_relations
                delete dish.dish_ratings
                delete dish.dish_comments
            })

            return this._handleSuccess({ 
                collection,
                dishes
            })
        } catch (error) {
            return this._handleError('Collection with dishes fetch', error)
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

            // Check if dish exists
            const { data: dish, error: dishError } = await this.supabase
                .from('dishes')
                .select('id, status')
                .eq('id', dishId)
                .single()

            if (dishError || !dish) {
                return {
                    success: false,
                    error: 'Dish not found',
                    message: 'The specified dish does not exist'
                }
            }

            // Check if dish is already in collection
            const { data: existingItem, error: checkError } = await this.supabase
                .from('dish_collection_items')
                .select('id')
                .eq('collection_id', collectionId)
                .eq('dish_id', dishId)
                .eq('user_id', userId)
                .maybeSingle()

            if (existingItem) {
                return {
                    success: false,
                    error: CollectionService.ERRORS.DISH_ALREADY_IN_COLLECTION,
                    message: 'This dish is already in the collection'
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

    async deleteCollection(userId, collectionId) {
        try {
            // Check if collection exists
            const { exists, collection } = await this._getCollectionById(collectionId)
            
            if (!exists) {
                return {
                    success: false,
                    error: CollectionService.ERRORS.COLLECTION_NOT_FOUND,
                    message: 'The specified collection does not exist'
                }
            }
            
            // Check if user owns the collection
            if (collection.user_id !== userId) {
                return {
                    success: false,
                    error: CollectionService.ERRORS.ACCESS_DENIED,
                    message: 'You do not have permission to delete this collection'
                }
            }
            
            // Check if it's a system collection
            if (collection.collection_type === 'system') {
                return {
                    success: false,
                    error: CollectionService.ERRORS.SYSTEM_COLLECTION,
                    message: 'System collections cannot be deleted'
                }
            }
            
            // First delete all items in the collection
            const { error: itemsError } = await this.supabase
                .from('dish_collection_items')
                .delete()
                .eq('collection_id', collectionId)
                
            if (itemsError) {
                return this._handleError('Delete collection items', itemsError, 'Unable to delete collection items')
            }
            
            // Then delete the collection
            const { error } = await this.supabase
                .from('dish_collections')
                .delete()
                .eq('id', collectionId)
                
            if (error) {
                return this._handleError('Delete collection', error, 'Unable to delete collection')
            }
            
            return this._handleSuccess({}, CollectionService.MESSAGES.COLLECTION_DELETED)
        } catch (error) {
            return this._handleError('Delete collection', error)
        }
    }

    async addDishToSystemCollections(dishId, userId, dishStatus) {
        try {

            const { data: systemCollections, error: collectionsError } = await this.supabase
                .from('dish_collections')
                .select('id, system_type')
                .eq('user_id', userId)
                .eq('collection_type', 'system')
                
            if (collectionsError || !systemCollections) {
                return this._handleError('Get system collections', collectionsError)
            }
    
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
                    .on_conflict(['collection_id', 'dish_id', 'user_id'])
                    .ignore()
    
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
                .select('id, system_type')
                .eq('user_id', userId)
                .eq('collection_type', 'system')

            if (systemCollections && systemCollections.length > 0) {
                // Remove from all system collections first
                const collectionIds = systemCollections.map(c => c.id)
                await this.supabase
                    .from('dish_collection_items')
                    .delete()
                    .eq('dish_id', dishId)
                    .eq('user_id', userId)
                    .in('collection_id', collectionIds)
            }

            // Add to appropriate system collections based on new status
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
                
                // Try again to get the collection
                const retryResult = await this._getSystemCollectionByType(userId, type)
                if (!retryResult.exists) {
                    return {
                        success: false,
                        error: CollectionService.ERRORS.COLLECTION_NOT_FOUND,
                        message: `System collection '${type}' not found for user`
                    }
                }
                
                // Use the newly created collection
                return await this.getDishesByType(userId, type)
            }

            const { data: collectionItems, error } = await this.supabase
                .from('dish_collection_items')
                .select(`
                    *,
                    dishes(
                        *,
                        dish_category_relations(
                            dish_categories(name)
                        ),
                        profiles(full_name, profile_tag, avatar_url),
                        dish_ratings(rating_type),
                        dish_comments(id)
                    )
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
                    ratings: dish.dish_ratings || [],
                    comments_count: dish.dish_comments?.length || 0,
                    added_to_collection_at: item.added_at
                }
            }) || []

            // Clean up nested properties
            dishes.forEach(dish => {
                delete dish.dish_category_relations
                delete dish.dish_ratings
                delete dish.dish_comments
            })

            return this._handleSuccess({ dishes })
        } catch (error) {
            return this._handleError('Get dishes by type', error)
        }
    }
}

export default CollectionService