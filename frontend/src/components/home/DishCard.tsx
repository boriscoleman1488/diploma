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
  ArrowRight,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface DishCardProps {
  dish: Dish
  onViewDetails: () => void
}

export function DishCard({ dish, onViewDetails }: DishCardProps) {
  const cookingTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0
  const likesCount = dish.ratings?.filter(r => r.rating === 1).length || 0
  const hasIngredients = dish.ingredients && dish.ingredients.length > 0
  
  const getDishCategories = (dish: Dish) => {
    if (!dish.categories || !Array.isArray(dish.categories)) return []
    
    return dish.categories
      .map(categoryRelation => categoryRelation.dish_categories)
      .filter(Boolean)
  }
  
  const dishCategories = getDishCategories(dish)

  return (
    <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
      {/* Image */}
      <div 
        className="aspect-video bg-gray-200 overflow-hidden relative"
        onClick={onViewDetails}
      >
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
        
        {/* Nutrition Badge */}
        {hasIngredients && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Activity className="w-3 h-3 mr-1" />
              Аналіз калорій
            </span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Переглянути
            </Button>
          </div>
        </div>
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
                {cat.name}
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
            {cookingTime > 0 && (
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
          <Link href={`/dishes/${dish.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              Детальніше
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}