import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatRelativeTime } from '@/lib/utils'
import { AiChatMessage } from '@/types/aiChat'
import { 
  Search, 
  MessageCircle, 
  Bot, 
  User, 
  X 
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface AiChatMessageSearchProps {
  searchQuery: string
  onSearch: (query: string) => void
  searchResults: AiChatMessage[]
  isSearching: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onClearResults: () => void
}

export function AiChatMessageSearch({ 
  searchQuery,
  onSearch,
  searchResults,
  isSearching,
  pagination,
  onPageChange,
  onClearResults
}: AiChatMessageSearchProps) {
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук повідомлень за змістом..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              />
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearResults}
                leftIcon={<X className="w-4 h-4" />}
              >
                Очистити
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Результати пошуку
            </div>
            {searchResults.length > 0 && (
              <span className="text-sm text-gray-500">
                Знайдено {pagination.total} повідомлень
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'Повідомлення не знайдено' : 'Введіть пошуковий запит'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {message.role === 'user' ? 'Користувач' : 'AI-асистент'}
                          </span>
                          {message.ai_chat_sessions?.profiles && (
                            <span className="text-sm text-gray-500">
                              ({message.ai_chat_sessions.profiles.full_name || message.ai_chat_sessions.profiles.email})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      {message.ai_chat_sessions && (
                        <div className="text-xs text-gray-500">
                          Чат: "{message.ai_chat_sessions.title}" • ID: {message.ai_chat_sessions.id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Показано {((pagination.page - 1) * pagination.limit) + 1} до{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} з{' '}
                    {pagination.total} результатів
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Попередня
                    </Button>
                    <span className="text-sm text-gray-700">
                      Сторінка {pagination.page} з {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Наступна
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Actions */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Дії з чатом</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Видалити чат</p>
                <p className="text-sm text-gray-500">
                  Видалити цей чат та всі повідомлення. Ця дія незворотна.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting === session.id}
                leftIcon={isDeleting === session.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {isDeleting === session.id ? 'Видалення...' : 'Видалити'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}