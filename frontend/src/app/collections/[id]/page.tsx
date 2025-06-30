'use client'

import { useParams } from 'next/navigation'
import { useCollectionDetail } from '@/hooks/useCollectionDetail'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CollectionHeader } from '@/components/collections/CollectionHeader'
import { CollectionSearch } from '@/components/collections/CollectionSearch'
import { DishGrid } from '@/components/collections/DishGrid'
import { EmptyCollectionState } from '@/components/collections/EmptyCollectionState'
import { EditCollectionModal } from '@/components/collections/EditCollectionModal'
import { AuthRequiredMessage } from '@/components/collections/AuthRequiredMessage'
import { useAuthStore } from '@/store/authStore'

export default function CollectionDetailPage() {
  const { id } = useParams() as { id: string }
  const { isAuthenticated } = useAuthStore()
  
  const {
    collection,
    filteredDishes,
    isLoading,
    searchQuery,
    setSearchQuery,
    isRemoving,
    showEditModal,
    setShowEditModal,
    isOwner,
    updateCollection,
    removeDish,
    getTotalCookingTime,
    getDishCategories
  } = useCollectionDetail(id)

  if (!isAuthenticated) {
    return <AuthRequiredMessage />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження колекції...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Колекцію не знайдено</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CollectionHeader 
        collection={collection}
        isOwner={isOwner}
        onEditClick={() => setShowEditModal(true)}
      />

      {/* Search */}
      <CollectionSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <EmptyCollectionState searchQuery={searchQuery} />
      ) : (
        <DishGrid 
          dishes={filteredDishes}
          isOwner={isOwner}
          isRemoving={isRemoving}
          onRemoveDish={removeDish}
          getTotalCookingTime={getTotalCookingTime}
          getDishCategories={getDishCategories}
        />
      )}

      {/* Edit Collection Modal */}
      <EditCollectionModal
        collection={collection}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={updateCollection}
      />
    </div>
  )
}