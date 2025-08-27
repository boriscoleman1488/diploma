import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatRelativeTime } from '@/lib/utils'
import { AiChatSession } from '@/types/aiChat'
import { 
  Bot, 
  Eye, 
  Trash2,
  MessageCircle,
  Calendar,
  User
} from 'lucide-react'

interface AiChatSessionsTableProps {
  sessions: AiChatSession[]
  isLoading: boolean
  isDeleting: string | null
  onViewSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string, sessionTitle: string) => Promise<boolean>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

export function AiChatSessionsTable({ 
  sessions, 
  isLoading, 
  isDeleting,
  onViewSession, 
  onDeleteSession,
  pagination,
  onPageChange
}: AiChatSessionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Чати не знайдено</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          AI-чати користувачів
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Чат
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Користувач
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Повідомлень
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Останнє оновлення
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bot className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {session.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={session.profiles?.avatar_url}
                        name={session.profiles?.full_name || session.profiles?.email}
                        size="sm"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {session.profiles?.full_name || 'Невідомо'}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{session.profiles?.profile_tag || 'user'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                      {session.messages_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatRelativeTime(session.updated_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewSession(session.id)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Переглянути
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteSession(session.id, session.title)}
                        disabled={isDeleting === session.id}
                        leftIcon={isDeleting === session.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        {isDeleting === session.id ? 'Видалення...' : 'Видалити'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </CardContent>
    </Card>
  )
}