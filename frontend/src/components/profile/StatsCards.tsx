import { Card, CardContent } from '@/components/ui/Card'
import { ProfileStats } from '@/types/profile'
import { User } from '@/types/auth'
import { 
  ChefHat, 
  Heart, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Clock
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface StatsCardsProps {
  stats: ProfileStats
  user: User | null
}

export function StatsCards({ stats, user }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ChefHat className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Додано страв</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recipesCreated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Поставлено лайків</p>
              <p className="text-2xl font-bold text-gray-900">{stats.likesGiven}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Збережено страв</p>
              <p className="text-2xl font-bold text-gray-900">{stats.favoriteRecipes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              {user?.emailConfirmed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Статус електронної пошти</p>
              <p className="text-sm font-semibold text-gray-900">
                {user?.emailConfirmed ? 'Підтверджено' : 'Не підтверджено'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Останній вхід</p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.lastLogin !== 'Unknown' 
                  ? formatRelativeTime(stats.lastLogin)
                  : 'Невідомо'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}