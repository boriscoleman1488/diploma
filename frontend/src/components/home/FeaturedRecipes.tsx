'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, Heart } from 'lucide-react'
import { Recipe } from '@/types'
import { api } from '@/lib/api'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { getImageUrl, formatDuration } from '@/lib/utils'

export function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const response = await api.getRecipes({ limit: 6, status: 'approved' })
        if (response.success) {
          setRecipes(response.dishes || [])
        }
      } catch (error) {
        console.error('Failed to fetch featured recipes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedRecipes()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Recipes
            </h2>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Recipes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our most popular and highly-rated recipes from talented chefs around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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

        <div className="text-center">
          <Link href="/recipes">
            <Button size="lg">
              View All Recipes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}