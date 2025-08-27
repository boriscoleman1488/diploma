import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { ActiveUser } from '@/types/aiChat'
import { 
  Users, 
  MessageCircle, 
  Bot 
} from 'lucide-react'

interface ActiveUsersCardProps {
  activeUsers: ActiveUser[]
}

export function ActiveUsersCard({ activeUsers }: ActiveUsersCardProps) {
  if (activeUsers.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Найактивніші користувачі AI-чату
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeUsers.map((userStat, index) => (
            <div key={userStat.user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar
                    src={userStat.user.avatar_url}
                    name={userStat.user.full_name || userStat.user.email}
                    size="sm"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userStat.user.full_name || 'Невідомо'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{userStat.user.profile_tag || 'user'}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Bot className="w-3 h-3 mr-1" />
                    {userStat.sessionsCount} чатів
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {userStat.messagesCount} повідомлень
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}