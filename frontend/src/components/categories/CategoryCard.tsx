'use client'

import Link from 'next/link'
import { Category } from '@/types/category'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  Calendar, 
  Hash, 
  ChefHat,
  ArrowRight,
  Star,
  TrendingUp,
  Eye
} from 'lucide-react'

interface CategoryCardProps {
  category: Category
  viewMode: 'grid' | 'list'
}

export function CategoryCard({ category, viewMode }: CategoryCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-200 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    {category.description || 'Без опису'}
                  </p>
                  <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                      <Hash className="w-4 h-4 mr-1" />
                      <span className="font-medium">{category.dishes_count || 0} рецептів</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatRelativeTime(category.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link href={`/categories/${category.id}`}>
              <div className="p-3 rounded-full bg-gray-100 group-hover:bg-orange-100 transition-colors duration-200">
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-orange-600 transition-colors duration-200" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link href={`/categories/${category.id}`}>
      <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-lg group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="p-8 relative">
          <div className="text-center">
            {/* Enhanced Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-10 h-10 text-orange-600" />
              </div>
            </div>
            
            {/* Enhanced Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
              {category.name}
            </h3>
            
            {/* Enhanced Description */}
            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
              {category.description || 'Без опису'}
            </p>
            
            {/* Enhanced Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg px-4 py-2 group-hover:from-orange-100 group-hover:to-orange-200 transition-colors duration-200">
                <Hash className="w-4 h-4 mr-2 text-orange-600" />
                <span className="font-semibold text-orange-800">{category.dishes_count || 0}</span>
                <span className="ml-1 text-orange-700">рецептів</span>
              </div>
              
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(category.created_at)}</span>
              </div>
            </div>

            {/* Hover Effect Indicator */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-center text-orange-600 text-sm font-medium">
                <Eye className="w-4 h-4 mr-1" />
                Переглянути категорію
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}