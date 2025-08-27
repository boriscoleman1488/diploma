import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { AiChatSession, AiChatMessage } from '@/types/aiChat'
import { 
  Bot, 
  User, 
  Trash2, 
  X, 
  MessageCircle, 
  Calendar, 
  Clock 
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface AiChatSessionModalProps {
  session: AiChatSession | null
  messages: AiChatMessage[]
  isOpen: boolean
  onClose: () => void
  onDelete: (sessionId: string, sessionTitle: string) => Promise<boolean>
  isDeleting: string | null
}

export function AiChatSessionModal({ 
  session, 
  messages, 
  isOpen, 
  onClose, 
  onDelete, 
  isDeleting 
}: AiChatSessionModalProps) {
  if (!isOpen || !session) return null

  const handleDelete = () => {
    onDelete(session.id, session.title)
  }

  const userMessages = messages.filter(msg => msg.role === 'user')
  const assistantMessages = messages.filter(msg => msg.role === 'assistant')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Деталі AI-чату
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
          >
            Закрити
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Інформація про чат</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Назва чату</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID сесії</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{session.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Створено</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(session.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Останнє оновлення</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatRelativeTime(session.updated_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Кількість повідомлень</dt>
                    <dd className="mt-1 text-sm text-gray-900">{messages.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Користувач</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar
                    src={session.profiles?.avatar_url}
                    name={session.profiles?.full_name || session.profiles?.email}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.profiles?.full_name || 'Невідомий користувач'}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{session.profiles?.profile_tag || 'user'}
                    </p>
                    <p className="text-sm text-gray-500">{session.profiles?.email}</p>
                  </div>
                </div>
                
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID користувача</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{session.user_id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Статистика</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userMessages.length} запитів, {assistantMessages.length} відповідей
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Повідомлення чату</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">У цьому чаті немає повідомлень</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary-100 text-primary-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 mr-2" />
                          ) : (
                            <Bot className="w-4 h-4 mr-2" />
                          )}
                          <span className="text-xs font-medium">
                            {message.role === 'user' ? 'Користувач' : 'AI-асистент'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatRelativeTime(message.created_at)}
                          </span>
                        </div>
                        
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Небезпечна зона</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Видалити чат</p>
                  <p className="text-sm text-gray-500">
                    Ця дія незворотна. Чат та всі повідомлення будуть видалені.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting === session.id}
                  leftIcon={isDeleting === session.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {isDeleting === session.id ? 'Видалення...' : 'Видалити чат'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}