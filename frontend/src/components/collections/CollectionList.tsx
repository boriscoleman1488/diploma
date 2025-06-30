import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Collection } from '@/types/collection'
import { formatRelativeTime } from '@/lib/utils'
import { 
  BookOpen, 
  ChefHat, 
  Eye, 
  Trash2 
} from 'lucide-react'
import Link from 'next/link'

interface CollectionListProps {
  collections: Collection[]
  isDeleting: string | null
  onDelete: (collectionId: string, collectionName: string) => Promise<boolean>
  getCollectionItemsCount: (collection: Collection) => number
}

export function CollectionList({ 
  collections, 
  isDeleting, 
  onDelete,
  getCollectionItemsCount
}: CollectionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => {
        const itemsCount = getCollectionItemsCount(collection)
        
        return (
          <Card key={collection.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="ml-2">{collection.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => onDelete(collection.id, collection.name)}
                    disabled={isDeleting === collection.id}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {isDeleting === collection.id ? 'Видалення...' : 'Видалити'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collection.description && (
                  <p className="text-sm text-gray-600">
                    {collection.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <ChefHat className="w-4 h-4 mr-1" />
                    {itemsCount} {itemsCount === 1 ? 'страва' : itemsCount > 1 && itemsCount < 5 ? 'страви' : 'страв'}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(collection.created_at)}
                    </span>
                  </div>
                </div>
                
                {/* Preview of dishes */}
                {itemsCount > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex -space-x-2 overflow-hidden">
                      {collection.dish_collection_items?.slice(0, 5).map((item) => (
                        <div key={item.dish_id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200">
                          {item.dishes.main_image_url ? (
                            <img
                              src={item.dishes.main_image_url}
                              alt={item.dishes.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ChefHat className="h-full w-full p-1 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {itemsCount > 5 && (
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
                          <span className="text-xs font-medium text-gray-500">+{itemsCount - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <Link href={`/collections/${collection.id}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    Переглянути колекцію
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}