'use client'

import Link from 'next/link'
import { Category } from '@/types/category'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  Calendar, 
  Hash, 
  ChefHat,
  ArrowRight
} from 'lucide-react'

interface CategoryCardProps {
  category: Category
  viewMode: 'grid' | 'list'
}

export function CategoryCard({ category, viewMode }: CategoryCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <ChefHat className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {category.description || 'Без опису'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 mr-1" />
                      {category.dishes_count || 0} рецептів
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatRelativeTime(category.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link href={`/categories/${category.id}`}>
              <ArrowRight className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link href={`/categories/${category.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="p-4 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {category.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {category.description || 'Без опису'}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Hash className="w-4 h-4 mr-1" />
                {category.dishes_count || 0} рецептів
              </div>
              
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(category.created_at)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}