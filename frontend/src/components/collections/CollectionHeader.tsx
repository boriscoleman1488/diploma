import { Button } from '@/components/ui/Button'
import { Collection } from '@/types/collection'
import { ArrowLeft, Edit, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface CollectionHeaderProps {
  collection: Collection
  isOwner: boolean
  onEditClick: () => void
}

export function CollectionHeader({ collection, isOwner, onEditClick }: CollectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/collections">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-6 h-6 text-gray-600 mr-2" />
            <span className="ml-2">{collection.name}</span>
          </h1>
          {collection.description && (
            <p className="mt-1 text-gray-600">{collection.description}</p>
          )}
        </div>
      </div>
      {isOwner && (
        <Button
          variant="outline"
          leftIcon={<Edit className="w-4 h-4" />}
          onClick={onEditClick}
        >
          Редагувати
        </Button>
      )}
    </div>
  )
}