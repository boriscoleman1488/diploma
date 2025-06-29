'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { useAiChat } from '@/hooks/useAiChat'
import { 
  ChefHat, 
  Search, 
  Send,
  Trash2,
  Plus,
  MessageCircle,
  Bot,
  Sparkles,
  X,
  Edit,
  MoreVertical,
  Folder,
  History,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function AiChefPage() {
  const { isAuthenticated } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [showSessions, setShowSessions] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [showSessionMenu, setShowSessionMenu] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  
  const {
    searchQuery,
    searchResults,
    isSearching,
    selectedIngredients,
    preferences,
    messages,
    isGenerating,
    showSearchResults,
    chatSessions,
    currentSession,
    isLoadingMessages,
    isLoadingSessions,
    userInput,
    isSubmittingUserInput,
    
    setSearchQuery,
    setPreferences,
    setShowSearchResults,
    setUserInput,
    
    fetchChatSessions,
    createNewSession,
    loadChatSession,
    updateSessionTitle,
    deleteSession,
    searchIngredients,
    addIngredient,
    removeIngredient,
    updateIngredientAmount,
    updateIngredientUnit,
    clearAllIngredients,
    generateRecipe,
    sendUserMessage,
    startNewChat
  } = useAiChat()

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Fetch chat sessions when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatSessions()
    }
  }, [isAuthenticated, fetchChatSessions])

  const handleCreateNewSession = async () => {
    setIsCreatingSession(true)
    const session = await createNewSession(newSessionTitle)
    if (session) {
      setNewSessionTitle('')
      setShowSessions(false)
    }
    setIsCreatingSession(false)
  }

  const handleLoadChatSession = async (session: any) => {
    const success = await loadChatSession(session)
    if (success) {
      setShowSessions(false)
    }
  }

  const handleUpdateSessionTitle = async () => {
    if (!currentSession || !editedTitle.trim()) return
    
    const success = await updateSessionTitle(currentSession.id, editedTitle)
    if (success) {
      setIsEditingTitle(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!currentSession) return
    
    if (!confirm('Ви впевнені, що хочете видалити цей чат? Ця дія незворотна.')) {
      return
    }
    
    const success = await deleteSession(currentSession.id)
    if (success) {
      setShowSessionMenu(false)
    }
  }

  const handleSearchIngredients = async () => {
    if (!searchQuery.trim()) return
    await searchIngredients(searchQuery)
  }

  const handleAddIngredient = (food: any) => {
    addIngredient({
      name: food.label,
      foodId: food.foodId,
      amount: 100,
      unit: 'г'
    })
  }

  const handleAddCustomIngredient = () => {
    if (!searchQuery.trim()) return
    
    addIngredient({
      name: searchQuery.trim(),
      amount: 100,
      unit: 'г'
    })
    
    // Clear search after adding
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchIngredients()
    }
  }

  const handleUserInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendUserMessage()
    }
  }

  const handleSendUserMessage = async () => {
    if (!userInput.trim()) return
    await sendUserMessage(userInput)
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
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowSessions(true)}
                  leftIcon={<History className="w-4 h-4" />}
                  className="bg-white text-primary-600 hover:bg-primary-50"
                >
                  Історія чатів
                </Button>
                {currentSession && (
                  <Button
                    variant="secondary"
                    onClick={startNewChat}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="bg-white text-primary-600 hover:bg-primary-50"
                  >
                    Новий чат
                  </Button>
                )}
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
                      onClick={handleSearchIngredients}
                      disabled={!searchQuery.trim() || isSearching}
                      leftIcon={<Search className="w-4 h-4" />}
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
                        onClick={clearAllIngredients}
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
                          className="p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-900 font-medium">{ingredient.name}</span>
                            <button
                              onClick={() => removeIngredient(index)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1/2">
                              <Input
                                type="number"
                                value={ingredient.amount || 100}
                                onChange={(e) => updateIngredientAmount(index, Number(e.target.value))}
                                min={1}
                                className="text-sm"
                              />
                            </div>
                            <div className="w-1/2">
                              <select
                                value={ingredient.unit || 'г'}
                                onChange={(e) => updateIngredientUnit(index, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="г">г</option>
                                <option value="кг">кг</option>
                                <option value="мл">мл</option>
                                <option value="л">л</option>
                                <option value="шт">шт</option>
                                <option value="ст.л.">ст.л.</option>
                                <option value="ч.л.">ч.л.</option>
                                <option value="склянка">склянка</option>
                                <option value="пучок">пучок</option>
                              </select>
                            </div>
                          </div>
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
                  onClick={generateRecipe}
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
                  {currentSession ? (
                    <div className="flex items-center flex-1">
                      {isEditingTitle ? (
                        <div className="flex items-center w-full">
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="mr-2"
                            placeholder="Назва чату"
                          />
                          <Button
                            size="sm"
                            onClick={handleUpdateSessionTitle}
                            disabled={!editedTitle.trim()}
                          >
                            Зберегти
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingTitle(false)}
                            className="ml-2"
                          >
                            Скасувати
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CardTitle className="flex items-center mr-2">
                            <Bot className="w-5 h-5 mr-2" />
                            {currentSession.title}
                          </CardTitle>
                          <button
                            onClick={() => {
                              setEditedTitle(currentSession.title)
                              setIsEditingTitle(true)
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <CardTitle className="flex items-center">
                      <Bot className="w-5 h-5 mr-2" />
                      Чат з AI-шефом
                    </CardTitle>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {currentSession && (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSessionMenu(!showSessionMenu)}
                          leftIcon={<MoreVertical className="w-4 h-4" />}
                        >
                          Опції
                        </Button>
                        
                        {showSessionMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                            <button
                              onClick={() => {
                                setEditedTitle(currentSession.title)
                                setIsEditingTitle(true)
                                setShowSessionMenu(false)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Перейменувати
                            </button>
                            <button
                              onClick={handleDeleteSession}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Видалити
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
              
              {/* User input field */}
              {currentSession && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Напишіть повідомлення..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleUserInputKeyDown}
                      disabled={isSubmittingUserInput}
                    />
                    <Button
                      onClick={handleSendUserMessage}
                      disabled={!userInput.trim() || isSubmittingUserInput}
                      leftIcon={isSubmittingUserInput ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                    >
                      Надіслати
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Sessions Modal */}
      {showSessions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Історія чатів
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessions(false)}
                leftIcon={<X className="w-4 h-4" />}
              >
                Закрити
              </Button>
            </div>
            
            <div className="p-6">
              {/* Create New Chat */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    placeholder="Назва нового чату"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateNewSession}
                    disabled={isCreatingSession}
                    leftIcon={isCreatingSession ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />}
                  >
                    Створити
                  </Button>
                </div>
              </div>
              
              {/* Sessions List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Ваші чати
                </h3>
                
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">У вас ще немає чатів</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Створіть новий чат, щоб почати спілкування з AI-шефом
                    </p>
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${
                        currentSession?.id === session.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleLoadChatSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageCircle className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{session.title}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(session.updated_at).toLocaleDateString('uk-UA')}
                            </p>
                          </div>
                        </div>
                        {isLoadingMessages && currentSession?.id === session.id && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}