import { Card, CardContent } from '@/components/ui/Card'
import { 
  Heart, 
  TrendingUp
} from 'lucide-react'

interface RatingStatsCardsProps {
  stats: {
    likes: number
    weekly: {
      likes: number
    }
    monthly: {
      likes: number
    }
  } | null
}

export function RatingStatsCards({ stats }: RatingStatsCardsProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всього лайків</p>
              <p className="text-2xl font-bold text-gray-900">{stats.likes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">За тиждень</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weekly.likes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">За місяць</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthly.likes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Тенденція</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.weekly.likes > 0 ? '+' : ''}{stats.weekly.likes}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}