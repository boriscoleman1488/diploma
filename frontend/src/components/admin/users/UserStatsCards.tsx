import { Card, CardContent } from '@/components/ui/Card'
import { 
  Users, 
  User, 
  Shield 
} from 'lucide-react'

interface UserStatsCardsProps {
  stats: {
    totalUsers: number
    roleDistribution: {
      user: number
      admin: number
    }
  } | null
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всього користувачів</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Звичайні користувачі</p>
              <p className="text-2xl font-bold text-gray-900">{stats.roleDistribution.user || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Адміністратори</p>
              <p className="text-2xl font-bold text-gray-900">{stats.roleDistribution.admin || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}