import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Ingredient {
  name: string
  foodId?: string
  amount?: number
  unit?: string
  edamam_food_id?: string
}

export interface EdamamFood {
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

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  session_id?: string
  created_at?: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function useAiChat() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EdamamFood[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])
  const [preferences, setPreferences] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [isSubmittingUserInput, setIsSubmittingUserInput] = useState(false)

  // Fetch chat sessions

  const fetchChatSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const response = await apiClient.get('/ai/chat/sessions')
      if (response.success && response.sessions) {
        setChatSessions(response.sessions)
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error)
      toast.error('Не вдалося завантажити сесії чату')
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  // Create a new chat session
  const createNewSession = async (title?: string) => {
    setIsLoadingSessions(true)
    try {
      const sessionTitle = title?.trim() || 'Новий чат'
      const response = await apiClient.post('/ai/chat/sessions', { title: sessionTitle })
      
      if (response.success && response.session) {
        setChatSessions(prev => [response.session, ...prev])
        setCurrentSession(response.session)
        setMessages([])
        return response.session
      } else {
        toast.error('Не вдалося створити нову сесію чату')
        return null
      }
    } catch (error) {
      console.error('Failed to create new chat session:', error)
      toast.error('Не вдалося створити нову сесію чату')
      return null
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // Load a chat session
  const loadChatSession = async (session: ChatSession) => {
    setIsLoadingMessages(true)
    try {
      const response = await apiClient.get(`/ai/chat/sessions/${session.id}/messages`)
      
      if (response.success) {
        setCurrentSession(session)
        
        // Convert API messages to our Message format
        const formattedMessages = response.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          session_id: msg.session_id,
          created_at: msg.created_at
        }))
        
        setMessages(formattedMessages)
        return true
      } else {
        toast.error('Не вдалося завантажити повідомлення чату')
        return false
      }
    } catch (error) {
      console.error('Failed to load chat session:', error)
      toast.error('Не вдалося завантажити сесію чату')
      return false
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Update session title
  const updateSessionTitle = async (sessionId: string, title: string) => {
    if (!title.trim()) return false
    
    try {
      const response = await apiClient.patch(`/ai/chat/sessions/${sessionId}`, {
        title: title.trim()
      })
      
      if (response.success && response.session) {
        // Update current session
        setCurrentSession(response.session)
        
        // Update in sessions list
        setChatSessions(prev => 
          prev.map(session => 
            session.id === response.session.id ? response.session : session
          )
        )
        
        toast.success('Назву чату оновлено')
        return true
      } else {
        toast.error('Не вдалося оновити назву чату')
        return false
      }
    } catch (error) {
      console.error('Failed to update session title:', error)
      toast.error('Не вдалося оновити назву чату')
      return false
    }
  }

  // Delete a chat session
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await apiClient.delete(`/ai/chat/sessions/${sessionId}`)
      
      if (response.success) {
        toast.success('Чат видалено')
        
        // Update sessions list
        setChatSessions(prev => prev.filter(session => session.id !== sessionId))
        
        // Clear current session and messages if it was the deleted one
        if (currentSession?.id === sessionId) {
          setCurrentSession(null)
          setMessages([])
        }
        
        return true
      } else {
        toast.error('Не вдалося видалити чат')
        return false
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      toast.error('Не вдалося видалити сесію чату')
      return false
    }
  }

  // Search for ingredients
  const searchIngredients = async (query: string) => {
    if (!query.trim()) return []
    
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      const response = await apiClient.post('/ai/search-ingredients', {
        query: query.trim(),
        limit: 10
      })
      
      if (response.success && response.foods) {
        setSearchResults(response.foods)
        return response.foods
      } else {
        setSearchResults([])
        toast.error('Не вдалося знайти інгредієнти')
        return []
      }
    } catch (error) {
      console.error('Failed to search ingredients:', error)
      toast.error('Помилка пошуку інгредієнтів')
      setSearchResults([])
      return []
    } finally {
      setIsSearching(false)
    }
  }

  // Add ingredient from search results
  const addIngredient = (ingredient: Ingredient) => {
    // Check if ingredient already exists
    if (selectedIngredients.some(ing => 
      ing.foodId === ingredient.foodId || 
      ing.name.toLowerCase() === ingredient.name.toLowerCase()
    )) {
      toast.error('Цей інгредієнт вже додано')
      return false
    }
    
    const newIngredient = {
      ...ingredient,
      amount: ingredient.amount || 100,
      unit: ingredient.unit || 'г'
    }
    
    setSelectedIngredients(prev => [...prev, newIngredient])
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    return true
  }

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setSelectedIngredients(prev => {
      const newIngredients = [...prev]
      newIngredients.splice(index, 1)
      return newIngredients
    })
  }

  // Update ingredient amount
  const updateIngredientAmount = (index: number, amount: number) => {
    setSelectedIngredients(prev => {
      const newIngredients = [...prev]
      newIngredients[index] = { ...newIngredients[index], amount }
      return newIngredients
    })
  }

  // Update ingredient unit
  const updateIngredientUnit = (index: number, unit: string) => {
    setSelectedIngredients(prev => {
      const newIngredients = [...prev]
      newIngredients[index] = { ...newIngredients[index], unit }
      return newIngredients
    })
  }

  // Clear all ingredients and preferences
  const clearAllIngredients = () => {
    setSelectedIngredients([])
    setPreferences('')
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  // Generate recipe from ingredients
  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Додайте хоча б один інгредієнт')
      return false
    }
    
    setIsGenerating(true)
    
    // Create a new session if none exists
    let sessionId = currentSession?.id
    
    if (!sessionId) {
      try {
        const sessionResponse = await apiClient.post('/ai/chat/sessions', {
          title: selectedIngredients.map(ing => ing.name).join(', ').substring(0, 50)
        })
        
        if (sessionResponse.success && sessionResponse.session) {
          sessionId = sessionResponse.session.id
          setCurrentSession(sessionResponse.session)
          setChatSessions(prev => [sessionResponse.session, ...prev])
        } else {
          toast.error('Не вдалося створити сесію чату')
          setIsGenerating(false)
          return false
        }
      } catch (error) {
        console.error('Failed to create chat session:', error)
        toast.error('Не вдалося створити сесію чату')
        setIsGenerating(false)
        return false
      }
    }
    
    // Add user message to chat
    const ingredientsList = selectedIngredients.map(ing => `${ing.name} (${ing.amount} ${ing.unit})`).join(', ')
    const userMessage = `Що я можу приготувати з: ${ingredientsList}${preferences ? `. Мої вподобання: ${preferences}` : ''}`
    
    try {
      // Generate AI response
      const response = await apiClient.post('/ai/chat/generate-response', {
        sessionId,
        userMessage,
        previousMessages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
      
      if (response.success) {
        // Add both messages to the state
        const newUserMessage = {
          id: response.userMessage.id,
          role: 'user',
          content: userMessage,
          timestamp: new Date(response.userMessage.created_at),
          session_id: sessionId,
          created_at: response.userMessage.created_at
        }
        
        const newAssistantMessage = {
          id: response.aiMessage.id,
          role: 'assistant',
          content: response.aiMessage.content,
          timestamp: new Date(response.aiMessage.created_at),
          session_id: sessionId,
          created_at: response.aiMessage.created_at
        }
        
        setMessages(prev => [...prev, newUserMessage, newAssistantMessage])
        return true
      } else {
        toast.error('Не вдалося отримати відповідь')
        
        // If we have error message and user message, still add them
        if (response.userMessage && response.errorMessage) {
          const newUserMessage = {
            id: response.userMessage.id,
            role: 'user',
            content: userMessage,
            timestamp: new Date(response.userMessage.created_at),
            session_id: sessionId,
            created_at: response.userMessage.created_at
          }
          
          const errorMessage = {
            id: response.aiMessage?.id || Date.now().toString(),
            role: 'assistant',
            content: response.errorMessage || 'На жаль, сталася помилка. Спробуйте ще раз пізніше.',
            timestamp: new Date(),
            session_id: sessionId
          }
          
          setMessages(prev => [...prev, newUserMessage, errorMessage])
        }
        return false
      }
    } catch (error) {
      console.error('Failed to generate response:', error)
      toast.error('Помилка отримання відповіді')
      
      // Add user message and error message
      if (sessionId) {
        try {
          // Save user message manually
          const userMsgResponse = await apiClient.post(`/ai/chat/sessions/${sessionId}/messages`, {
            content: userMessage,
            role: 'user'
          })
          
          if (userMsgResponse.success) {
            const newUserMessage = {
              id: userMsgResponse.message.id,
              role: 'user',
              content: userMessage,
              timestamp: new Date(userMsgResponse.message.created_at),
              session_id: sessionId,
              created_at: userMsgResponse.message.created_at
            }
            
            const errorMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'На жаль, сталася помилка при генерації відповіді. Будь ласка, спробуйте пізніше.',
              timestamp: new Date(),
              session_id: sessionId
            }
            
            setMessages(prev => [...prev, newUserMessage, errorMessage])
            
            // Save error message
            await apiClient.post(`/ai/chat/sessions/${sessionId}/messages`, {
              content: errorMessage.content,
              role: 'assistant',
              metadata: { error: true }
            })
          }
        } catch (msgError) {
          console.error('Failed to save error message:', msgError)
        }
      }
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  // Send user message
  const sendUserMessage = async (message: string) => {
    if (!message.trim() || !currentSession) return false
    
    setIsSubmittingUserInput(true)
    
    try {
      // Generate AI response
      const response = await apiClient.post('/ai/chat/generate-response', {
        sessionId: currentSession.id,
        userMessage: message.trim(),
        previousMessages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
      
      if (response.success) {
        // Add both messages to the state
        const newUserMessage = {
          id: response.userMessage.id,
          role: 'user',
          content: message.trim(),
          timestamp: new Date(response.userMessage.created_at),
          session_id: currentSession.id,
          created_at: response.userMessage.created_at
        }
        
        const newAssistantMessage = {
          id: response.aiMessage.id,
          role: 'assistant',
          content: response.aiMessage.content,
          timestamp: new Date(response.aiMessage.created_at),
          session_id: currentSession.id,
          created_at: response.aiMessage.created_at
        }
        
        setMessages(prev => [...prev, newUserMessage, newAssistantMessage])
        setUserInput('')
        return true
      } else {
        toast.error('Не вдалося отримати відповідь')
        
        // If we have error message and user message, still add them
        if (response.userMessage && response.errorMessage) {
          const newUserMessage = {
            id: response.userMessage.id,
            role: 'user',
            content: message.trim(),
            timestamp: new Date(response.userMessage.created_at),
            session_id: currentSession.id,
            created_at: response.userMessage.created_at
          }
          
          const errorMessage = {
            id: response.aiMessage?.id || Date.now().toString(),
            role: 'assistant',
            content: response.errorMessage || 'На жаль, сталася помилка. Спробуйте ще раз пізніше.',
            timestamp: new Date(),
            session_id: currentSession.id
          }
          
          setMessages(prev => [...prev, newUserMessage, errorMessage])
        }
        return false
      }
    } catch (error) {
      console.error('Failed to generate response:', error)
      toast.error('Помилка отримання відповіді')
      return false
    } finally {
      setIsSubmittingUserInput(false)
    }
  }

  // Start a new chat
  const startNewChat = () => {
    setCurrentSession(null)
    setMessages([])
    setSelectedIngredients([])
    setPreferences('')
  }

  return {
    // State
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
    
    // Setters
    setSearchQuery,
    setPreferences,
    setShowSearchResults,
    setUserInput,
    
    // Actions
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
  }
}