import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Dish } from '@/types/dish'
import { formatRelativeTime } from '@/lib/utils'
import { 
  ChefHat, 
  Clock,
  Users,
  Heart,
  MessageCircle,
  Grid3X3,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface DishGridProps {
  dishes: Dish[]
  isOwner: boolean
  isRemoving: string | null
  onRemoveDish: (dishId: string) => void
  getTotalCookingTime: (dish: Dish) => number | null
  getDishCategories: (dish: Dish) => any[]
}

export function DishGrid({ 
  dishes, 
  isOwner, 
  isRemoving, 
  onRemoveDish, 
  getTotalCookingTime,
  getDishCategories
}: DishGridProps) {
  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          У цій колекції ще немає страв
        </h3>
        <p className="text-gray-600 mb-6">
          Додайте страви до цієї колекції
        </p>
        <Link href="/dishes">
          <Button leftIcon={<ChefHat className="w-4 h-4" />}>
            Переглянути страви
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => {
        const cookingTime = getTotalCookingTime(dish)
        const likesCount = dish.ratings?.filter(r => r.rating === 1 || r.rating === "1").length || 0
        const dishCategories = getDishCategories(dish)

        return (
          <Card key={dish.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
            {/* Image */}
            <div className="aspect-video bg-gray-200 overflow-hidden relative">
              {dish.main_image_url ? (
                <img
                  src={dish.main_image_url}
                  alt={dish.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  dish.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : dish.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dish.status === 'approved' ? 'Схвалено' : 
                   dish.status === 'pending' ? 'На розгляді' : 'Відхилено'}
                </span>
              </div>
              
              {/* Added Date Badge */}
              {dish.added_to_collection_at && (
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                    Додано {formatRelativeTime(dish.added_to_collection_at)}
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              {/* Header */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                  {dish.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {dish.description}
                </p>
              </div>

              {/* Categories */}
              {dishCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {dishCategories.slice(0, 2).map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {cat.dish_categories?.name || cat.name}
                    </span>
                  ))}
                  {dishCategories.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{dishCategories.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {dish.servings}
                  </div>
                  {cookingTime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {cookingTime}хв
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {likesCount}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {dish.comments_count || 0}
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar
                    src={dish.profiles?.avatar_url}
                    name={dish.profiles?.full_name || dish.profiles?.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {dish.profiles?.full_name || 'Невідомий автор'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(dish.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dishes/${dish.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      Переглянути
                    </Button>
                  </Link>
                  {isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => onRemoveDish(dish.id)}
                      disabled={isRemoving === dish.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {isRemoving === dish.id ? '...' : 'Видалити'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}