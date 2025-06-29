'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Avatar } from '@/components/ui/Avatar'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { 
  ChefHat, 
  Search, 
  Send,
  Trash2,
  Plus,
  MessageCircle,
  Bot,
  Sparkles,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface Ingredient {
  name: string
  foodId?: string
}

interface EdamamFood {
  foodId: string
  label: string
  category?: string
  image?: string
  nutrients?: {
    ENERC_KCAL?: number
    PROCNT?: number
    FAT?: number
    CHOCDF?: number
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AiChefPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EdamamFood[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])
  const [preferences, setPreferences] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuthStore()

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const searchIngredients = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      const response = await apiClient.post('/ai/search-ingredients', {
        query: searchQuery.trim(),
        limit: 10
      })
      
      if (response.success && response.foods) {
        setSearchResults(response.foods)
      } else {
        setSearchResults([])
        toast.error('Не вдалося знайти інгредієнти')
      }
    } catch (error) {
      console.error('Failed to search ingredients:', error)
      toast.error('Помилка пошуку інгредієнтів')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddIngredient = (food: EdamamFood) => {
    // Check if ingredient already exists
    if (selectedIngredients.some(ing => ing.foodId === food.foodId)) {
      toast.error('Цей інгредієнт вже додано')
      return
    }
    
    setSelectedIngredients([...selectedIngredients, {
      name: food.label,
      foodId: food.foodId
    }])
    
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleAddCustomIngredient = () => {
    if (!searchQuery.trim()) return
    
    // Check if ingredient already exists
    if (selectedIngredients.some(ing => ing.name.toLowerCase() === searchQuery.trim().toLowerCase())) {
      toast.error('Цей інгредієнт вже додано')
      return
    }
    
    setSelectedIngredients([...selectedIngredients, {
      name: searchQuery.trim()
    }])
    
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...selectedIngredients]
    newIngredients.splice(index, 1)
    setSelectedIngredients(newIngredients)
  }

  const handleClearAll = () => {
    setSelectedIngredients([])
    setPreferences('')
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleGetRecipes = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Додайте хоча б один інгредієнт')
      return
    }
    
    setIsGenerating(true)
    
    // Add user message to chat
    const ingredientsList = selectedIngredients.map(ing => ing.name).join(', ')
    const userMessage = `Що я можу приготувати з: ${ingredientsList}${preferences ? `. Мої вподобання: ${preferences}` : ''}`
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newUserMessage])
    
    try {
      const response = await apiClient.post('/ai/recipe-suggestions', {
        ingredients: selectedIngredients.map(ing => ing.name),
        preferences: preferences
      })
      
      if (response.success && response.suggestion) {
        const newAssistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.suggestion,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, newAssistantMessage])
      } else {
        toast.error('Не вдалося отримати страви')
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'На жаль, не вдалося згенерувати страви. Спробуйте інші інгредієнти або перевірте з`єднання.',
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Failed to get recipe suggestions:', error)
      toast.error('Помилка отримання страв')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'На жаль, сталася помилка при генерації страв. Будь ласка, спробуйте пізніше.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchIngredients()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ChefHat className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Увійдіть, щоб використовувати AI-шеф
          </h2>
          <p className="text-gray-600 mb-6">
            Для доступу до AI-шефа потрібно увійти в систему
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/login">
              <Button>Увійти</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Зареєструватися</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  AI-шеф
                </h1>
                <p className="text-primary-100 mt-1">
                  Отримайте страви на основі інгредієнтів, які у вас є
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingredients Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Пошук інгредієнтів
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Введіть назву інгредієнта..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                  />
                  
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={searchIngredients}
                      disabled={!searchQuery.trim() || isSearching}
                    >
                      Пошук
                    </Button>
                    <Button
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
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="flex justify-between items-center p-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Результати пошуку</span>
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {searchResults.map((food) => (
                        <button
                          key={food.foodId}
                          type="button"
                          onClick={() => handleAddIngredient(food)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{food.label}</p>
                              {food.category && (
                                <p className="text-sm text-gray-500">{food.category}</p>
                              )}
                            </div>
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-500 text-sm">
                          Інгредієнти не знайдено
                        </p>
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="text-gray-400 hover:text-gray-600"
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
                    </div>
                  )}
                </div>

                {/* Selected Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Вибрані інгредієнти ({selectedIngredients.length})
                    </h3>
                    {selectedIngredients.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        leftIcon={<Trash2 className="w-3 h-3" />}
                      >
                        Очистити все
                      </Button>
                    )}
                  </div>
                  
                  {selectedIngredients.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Додайте інгредієнти для пошуку страв
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedIngredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-gray-900">{ingredient.name}</span>
                          <button
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Вподобання (необов'язково)
                  </label>
                  <Input
                    placeholder="Напр.: вегетаріанське, без глютену, швидке..."
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGetRecipes}
                  disabled={selectedIngredients.length === 0 || isGenerating}
                  leftIcon={isGenerating ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                  className="w-full"
                >
                  {isGenerating ? 'Генерація страв...' : 'Отримати страви'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="flex flex-col h-[calc(100vh-16rem)]">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    Чат з AI-шефом
                  </CardTitle>
                  {messages.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearChat}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Очистити чат
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ваш персональний AI-шеф
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Додайте інгредієнти та отримайте страви, які можна приготувати з того, що у вас є.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary-100 text-primary-900'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}