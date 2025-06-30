import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Profile } from '@/types/profile'
import { User } from 'lucide-react'

interface ProfileInfoProps {
  profile: Profile
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Інформація профілю
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Повне ім'я</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {profile.full_name || 'Не вказано'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Тег профілю</dt>
            <dd className="mt-1 text-sm text-gray-900">
              @{profile.profile_tag || 'Не встановлено'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Електронна пошта</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Роль</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {profile.role}
              </span>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}