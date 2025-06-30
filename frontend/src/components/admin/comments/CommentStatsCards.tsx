import { Card, CardContent } from '@/components/ui/Card'
import { 
  MessageCircle, 
  CheckCircle, 
  Trash2 
} from 'lucide-react'

interface CommentStatsCardsProps {
  stats: {
    total: number
    active: number
    deleted: number
  } | null
}

export function CommentStatsCards({ stats }: CommentStatsCardsProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всього коментарів</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активні</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Видалені</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deleted}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}