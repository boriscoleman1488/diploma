'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { Search, Plus, X, AlertTriangle, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface EdamamFood {
  foodId: string
  label: string
  originalLabel?: string
  category?: string
  image?: string
  nutrients?: {
    ENERC_KCAL?: number
    PROCNT?: number
    FAT?: number
    CHOCDF?: number
  }
}

interface Ingredient {
  name: string
  amount: number
  unit: string
  edamam_food_id?: string
}

interface IngredientSearchProps {
  onAddIngredient: (ingredient: Ingredient) => void
  className?: string
}

export function IngredientSearch({ onAddIngredient, className }: IngredientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EdamamFood[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedFood, setSelectedFood] = useState<EdamamFood | null>(null)
  const [amount, setAmount] = useState<number>(100)
  const [unit, setUnit] = useState('г')
  const [error, setError] = useState<string | null>(null)
  const [showFoodDetails, setShowFoodDetails] = useState<string | null>(null)

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      setError(null)
      return
    }

    if (query.trim().length < 2) {
      setError('Введіть принаймні 2 символи для пошуку')
      setShowResults(true)
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError(null)
    try {
      // Try with English query first (since Edamam API works better with English)
      const englishQuery = query.trim();
      
      // Make the API request
      const response = await apiClient.get(`/edamam/search?query=${encodeURIComponent(englishQuery)}&limit=10`)
      
      if (response.success && response.foods && response.foods.length > 0) {
        setSearchResults(response.foods)
        setShowResults(true)
      } else {
        // If no results, show empty state with custom ingredient option
        setSearchResults([])
        setShowResults(true)
        setError(response.error || 'Інгредієнти не знайдено. Спробуйте ввести назву англійською мовою.')
      }
    } catch (error) {
      console.error('Failed to search foods:', error)
      setSearchResults([])
      setShowResults(true)
      
      // Handle rate limit error specifically
      if (error instanceof Error && error.message.includes('rate limit exceeded')) {
        setError('Перевищено ліміт запитів до API. Будь ласка, спробуйте пізніше або додайте інгредієнт вручну.')
        toast.error('Перевищено ліміт запитів до API. Спробуйте додати інгредієнт вручну.')
      } else {
        setError(error instanceof Error ? error.message : 'Помилка пошуку інгредієнтів')
        toast.error('Помилка пошуку інгредієнтів. Спробуйте додати інгредієнт вручну.')
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchClick = () => {
    searchFoods(searchQuery)
  }

  const handleSelectFood = (food: EdamamFood) => {
    setSelectedFood(food)
    setSearchQuery(food.label)
    setShowResults(false)
    setShowFoodDetails(null)
  }

  const handleAddIngredient = () => {
    if (!selectedFood || !amount) return

    const ingredient: Ingredient = {
      name: selectedFood.label,
      amount: amount,
      unit: unit,
      edamam_food_id: selectedFood.foodId
    }

    onAddIngredient(ingredient)
    
    // Reset form
    setSearchQuery('')
    setSelectedFood(null)
    setAmount(100)
    setUnit('г')
    setError(null)
    setShowFoodDetails(null)
  }

  const handleClearSelection = () => {
    setSelectedFood(null)
    setSearchQuery('')
    setShowResults(false)
    setError(null)
    setShowFoodDetails(null)
  }

  const handleAddCustomIngredient = () => {
    if (!searchQuery.trim()) return
    
    const ingredient: Ingredient = {
      name: searchQuery.trim(),
      amount: amount,
      unit: unit
    }
    
    onAddIngredient(ingredient)
    toast.success(`Інгредієнт "${searchQuery.trim()}" додано вручну`)
    
    // Reset form
    setSearchQuery('')
    setSelectedFood(null)
    setAmount(100)
    setUnit('г')
    setError(null)
    setShowFoodDetails(null)
  }

  const toggleFoodDetails = (foodId: string) => {
    if (showFoodDetails === foodId) {
      setShowFoodDetails(null)
    } else {
      setShowFoodDetails(foodId)
    }
  }

  const commonUnits = ['г', 'кг', 'мл', 'л', 'шт', 'ст.л.', 'ч.л.', 'склянка', 'пучок']

  return (
    <div className={className}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Пошук інгредієнтів</h4>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введіть назву інгредієнта (наприклад: tomato, chicken, rice)"
              leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              rightIcon={
                selectedFood && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearchClick()
                }
              }}
            />
            
            <div className="flex space-x-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSearchClick}
                disabled={!searchQuery.trim() || isSearching}
                leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              >
                {isSearching ? 'Пошук...' : 'Пошук інгредієнтів'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomIngredient}
                disabled={!searchQuery.trim()}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Додати вручну
              </Button>
            </div>

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center p-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Результати пошуку</span>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {searchResults.map((food) => (
                  <div key={food.foodId} className="border-b border-gray-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {food.image && (
                            <img
                              src={food.image}
                              alt={food.label}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{food.label}</p>
                            {food.originalLabel && food.originalLabel !== food.label && (
                              <p className="text-xs text-gray-500">Оригінальна назва: {food.originalLabel}</p>
                            )}
                            {food.category && (
                              <p className="text-sm text-gray-500">{food.category}</p>
                            )}
                            {food.nutrients?.ENERC_KCAL && (
                              <p className="text-xs text-gray-400">
                                {Math.round(food.nutrients.ENERC_KCAL)} ккал/100г
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFoodDetails(food.foodId);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </button>
                    
                    {/* Detailed Food Information */}
                    {showFoodDetails === food.foodId && (
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <h5 className="font-medium text-gray-900 mb-2">Поживна цінність (на 100г)</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {food.nutrients?.ENERC_KCAL !== undefined && (
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Калорії</p>
                              <p className="font-medium">{Math.round(food.nutrients.ENERC_KCAL)} ккал</p>
                            </div>
                          )}
                          {food.nutrients?.PROCNT !== undefined && (
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Білки</p>
                              <p className="font-medium">{Math.round(food.nutrients.PROCNT * 10) / 10} г</p>
                            </div>
                          )}
                          {food.nutrients?.FAT !== undefined && (
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Жири</p>
                              <p className="font-medium">{Math.round(food.nutrients.FAT * 10) / 10} г</p>
                            </div>
                          )}
                          {food.nutrients?.CHOCDF !== undefined && (
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Вуглеводи</p>
                              <p className="font-medium">{Math.round(food.nutrients.CHOCDF * 10) / 10} г</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSelectFood(food)}
                            leftIcon={<Plus className="w-3 h-3" />}
                          >
                            Додати інгредієнт
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-1.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">
                      {error || 'Інгредієнти не знайдено. Спробуйте інший запит.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomIngredient}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="w-full"
                >
                  Додати "{searchQuery}" вручну
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Спробуйте використати англійські назви (наприклад: "tomato" замість "помідор")
                </p>
              </div>
            )}
          </div>

          {/* Selected Food Details */}
          {selectedFood && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                {selectedFood.image && (
                  <img
                    src={selectedFood.image}
                    alt={selectedFood.label}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h5 className="font-medium text-gray-900">{selectedFood.label}</h5>
                  {selectedFood.originalLabel && selectedFood.originalLabel !== selectedFood.label && (
                    <p className="text-xs text-gray-500">Оригінальна назва: {selectedFood.originalLabel}</p>
                  )}
                  {selectedFood.category && (
                    <p className="text-sm text-gray-500">{selectedFood.category}</p>
                  )}
                </div>
              </div>

              {/* Nutritional Info */}
              {selectedFood.nutrients && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  {selectedFood.nutrients.ENERC_KCAL && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(selectedFood.nutrients.ENERC_KCAL)}
                      </p>
                      <p className="text-xs text-gray-500">ккал</p>
                    </div>
                  )}
                  {selectedFood.nutrients.PROCNT && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(selectedFood.nutrients.PROCNT * 10) / 10}г
                      </p>
                      <p className="text-xs text-gray-500">білки</p>
                    </div>
                  )}
                  {selectedFood.nutrients.FAT && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(selectedFood.nutrients.FAT * 10) / 10}г
                      </p>
                      <p className="text-xs text-gray-500">жири</p>
                    </div>
                  )}
                  {selectedFood.nutrients.CHOCDF && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(selectedFood.nutrients.CHOCDF * 10) / 10}г
                      </p>
                      <p className="text-xs text-gray-500">вуглеводи</p>
                    </div>
                  )}
                </div>
              )}

              {/* Amount and Unit */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Кількість
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    step={0.1}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Одиниця виміру
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {commonUnits.map((unitOption) => (
                      <option key={unitOption} value={unitOption}>
                        {unitOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddIngredient}
                disabled={!amount}
                leftIcon={<Plus className="w-4 h-4" />}
                className="w-full"
              >
                Додати інгредієнт
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}