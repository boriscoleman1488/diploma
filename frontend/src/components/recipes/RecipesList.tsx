'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Clock, Users, Heart } from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { getImageUrl } from '@/lib/utils'

export function RecipesList() {
  const { recipes, isLoading, pagination, setFilters } = useRecipes()

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No recipes found. Try adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={getImageUrl(recipe.mainImageUrl)}
                alt={recipe.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              {recipe.status !== 'approved' && (
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                    {recipe.status}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>30 min</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{recipe.ratings?.likes || 0}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {recipe.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {recipe.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={getImageUrl(recipe.author?.avatarUrl)}
                    alt={recipe.author?.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {recipe.author?.fullName}
                  </span>
                </div>
                
                <Link href={`/recipes/${recipe.id}`}>
                  <Button variant="outline" size="sm">
                    View Recipe
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === pagination.page ? 'primary' : 'outline'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}