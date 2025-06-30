import { useAdminUsers } from '@/hooks/useAdminUsers'
import { UserStatsCards } from '@/components/admin/users/UserStatsCards'
import { UserSearch } from '@/components/admin/users/UserSearch'
import { UsersTable } from '@/components/admin/users/UsersTable'
import { UserDetailsModal } from '@/components/admin/UserDetailsModal'

export default function AdminUsersPage() {
  const {
    users,
    selectedUser,
    stats,
    currentUserProfile,
    isLoading,
    isUpdating,
    pagination,
    fetchUsers,
    fetchUserDetails,
    updateUserRole,
    deleteUser,
    setSelectedUser,
    canModifyUser,
  } = useAdminUsers()

  const [showUserDetails, setShowUserDetails] = useState(false)

  const handleSearch = (query: string) => {
    fetchUsers(1, pagination.limit, query)
  }

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.limit)
  }

  const handleViewUser = async (userId: string) => {
    const user = await fetchUserDetails(userId)
    if (user) {
      setShowUserDetails(true)
    }
  }

  const handleCloseModal = () => {
    setShowUserDetails(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управління користувачами
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Керуйте користувачами та їх правами доступу
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={stats} />

      {/* Search */}
      <UserSearch 
        searchQuery=""
        onSearch={handleSearch}
      />

      {/* Users Table */}
      <UsersTable 
        users={users}
        isLoading={isLoading}
        currentUserProfile={currentUserProfile}
        canModifyUser={canModifyUser}
        onViewUser={handleViewUser}
        onRoleChange={updateUserRole}
        isUpdating={isUpdating}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModal}
          onRoleChange={updateUserRole}
          onDelete={deleteUser}
          isUpdating={isUpdating}
          canModifyUser={canModifyUser}
          currentUserProfile={currentUserProfile}
        />
      )}
    </div>
  )
}