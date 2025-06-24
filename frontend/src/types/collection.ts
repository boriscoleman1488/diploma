export interface Collection {
  id: string
  name: string
  description?: string
  collection_type: 'custom' | 'system'
  system_type?: 'my_dishes' | 'liked' | 'published' | 'private'
  created_at: string
  updated_at: string
  user_id: string
  dish_collection_items?: Array<{
    dish_id: string
    added_at: string
    dishes: {
      id: string
      title: string
      main_image_url?: string
      status: string
    }
  }>
}

export interface CreateCollectionData {
  name: string
  description?: string
}

export interface UpdateCollectionData {
  name?: string
  description?: string
}

export interface AddDishToCollectionData {
  dishId: string
}

export interface CollectionResponse {
  success: boolean
  collection?: Collection
  dishes?: any[]
  error?: string
  message?: string
}

export interface CollectionsResponse {
  success: boolean
  collections: Collection[]
  error?: string
  message?: string
}