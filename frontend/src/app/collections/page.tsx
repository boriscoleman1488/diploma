'use client'

import { useCollections } from '@/hooks/useCollections'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CollectionsHeader } from '@/components/collections/CollectionsHeader'
import { CollectionSearch } from '@/components/collections/CollectionSearch'
import { CollectionList } from '@/components/collections/CollectionList'
import { CreateCollectionModal } from '@/components/collections/CreateCollectionModal'
import { EmptyCollectionsState } from '@/components/collections/EmptyCollectionsState'
import { AuthRequiredMessage } from '@/components/collections/AuthRequiredMessage'

export default function CollectionsPage() {
  const { isAuthenticated } = useAuthStore()
  const {
    filteredCollections,
    isLoading,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    isDeleting,
    createCollection,
    deleteCollection,
    getCollectionItemsCount
  } = useCollections()

  if (!isAuthenticated) {
    return <AuthRequiredMessage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CollectionsHeader onCreateClick={() => setShowCreateModal(true)} />

      {/* Search */}
      <CollectionSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Collections Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCollections.length === 0 ? (
        <EmptyCollectionsState 
          searchQuery={searchQuery}
          onCreateClick={() => setShowCreateModal(true)}
        />
      ) : (
        <CollectionList 
          collections={filteredCollections}
          isDeleting={isDeleting}
          onDelete={deleteCollection}
          getCollectionItemsCount={getCollectionItemsCount}
        />
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createCollection}
      />
    </div>
  )
}