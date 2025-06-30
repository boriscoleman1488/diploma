import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Profile } from '@/types/profile'
import { 
  Mail, 
  Calendar, 
  Clock, 
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface UserHeaderProps {
  profile: Profile
}

export function UserHeader({ profile }: UserHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
        <div className="flex items-center space-x-6">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name || profile.email}
            size="xl"
            className="ring-4 ring-white"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">
              {profile.full_name || 'Невідомо'}
            </h1>
            <p className="text-primary-100 mt-1">
              @{profile.profile_tag || 'user'}
            </p>
            <div className="flex items-center mt-2 text-primary-100">
              <Mail className="w-4 h-4 mr-2" />
              {profile.email}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Приєднався {formatDate(profile.created_at)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Останнє оновлення {formatRelativeTime(profile.updated_at)}
            </div>
          </div>
          <Link href="/profile/settings">
            <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
              Редагувати профіль
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}