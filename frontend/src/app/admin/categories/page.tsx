'use client'

import { useState } from 'react'
import { useAdminCategories } from '@/hooks/useAdminCategories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CreateCategoryModal } from '@/components/categories/CreateCategoryModal'
import { EditCategoryModal } from '@/components/categories/EditCategoryModal'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Grid3X3,
  BarChart3,
  Calendar,
  Hash,
  Shield,
  Settings,
  TrendingUp,
  Users,
  Sparkles,
  Star,
  Crown,
  Zap
} from 'lucide-react'

export default function AdminCategoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const {
    categories,
    isLoading,
    isUpdating,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategories()

  const handleCreateCategory = async (data: { name: string; description?: string }) => {
    const result = await createCategory(data)
    if (result.success) {
      setShowCreateModal(false)
    }
  }

  const handleEditCategory = async (data: { name: string; description?: string }) => {
    if (!editingCategory) return
    
    const result = await updateCategory(editingCategory.id, data)
    if (result.success) {
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Ви впевнені, що хочете видалити категорію "${categoryName}"? Ця дія незворотна.`)) {
      await deleteCategory(categoryId)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalDishes = categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0)

  return (
    <div className="space-y-8">
      {/* Enhanced Admin Header */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 via-purple-600/20 to-blue-600/20"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-pink-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              {/* Enhanced Admin Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl animate-pulse"></div>
                <div className="relative p-6 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30">
                  <div className="flex items-center">
                    <Shield className="w-12 h-12 text-white mr-2" />
                    <Crown className="w-8 h-8 text-yellow-300" />
                  </div>
                </div>
              </div>
              
              <div>
                {/* Enhanced Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  Управління категоріями
                  <div className="inline-block ml-4">
                    <Settings className="w-10 h-10 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </h1>
                
                {/* Enhanced Subtitle */}
                <p className="text-xl text-white/90 leading-relaxed">
                  Керуйте категоріями рецептів та їх організацією з повними адміністративними правами
                </p>
                
                {/* Admin Badge */}
                <div className="flex items-center mt-4">
                  <div className="bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-300/30">
                    <div className="flex items-center text-yellow-200">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Адміністративна панель</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced CTA Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
              leftIcon={<Plus className="w-6 h-6" />}
            >
              Створити категорію
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Grid3X3 className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700 mb-1">Всього категорій</p>
                <p className="text-3xl font-bold text-blue-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700 mb-1">Всього рецептів</p>
                <p className="text-3xl font-bold text-green-900">{totalDishes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-xl"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Hash className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700 mb-1">Середньо на категорію</p>
                <p className="text-3xl font-bold text-purple-900">
                  {categories.length > 0 ? Math.round(totalDishes / categories.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full blur-xl"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700 mb-1">Створено сьогодні</p>
                <p className="text-3xl font-bold text-orange-900">
                  {categories.filter(cat => {
                    const today = new Date().toDateString()
                    const catDate = new Date(cat.created_at).toDateString()
                    return today === catDate
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
        <CardContent className="p-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Пошук категорій за назвою або описом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Categories Table */}
      <Card className="shadow-2xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="flex items-center text-2xl font-bold">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4">
              <Grid3X3 className="w-8 h-8 text-white" />
            </div>
            Список категорій
            <span className="ml-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {filteredCategories.length} категорій
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative p-8 bg-white rounded-full shadow-2xl">
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Завантаження категорій</h3>
                <p className="text-gray-600 text-lg">Підготовуємо адміністративну панель...</p>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="text-9xl mb-4 animate-bounce">📂</div>
                <div className="absolute inset-0 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery ? 'Категорії не знайдено' : 'Немає категорій'}
              </h3>
              <p className="text-gray-600 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
                {searchQuery 
                  ? 'Спробуйте інший пошуковий запит'
                  : 'Створіть першу категорію для організації рецептів'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  leftIcon={<Plus className="w-6 h-6" />}
                  className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Створити категорію
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Назва
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Опис
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Рецептів
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Створено
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-200">
                            <Grid3X3 className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {category.description || 'Без опису'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                          {category.dishes_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(category.created_at)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatRelativeTime(category.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                            leftIcon={<Edit className="w-4 h-4" />}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                          >
                            Редагувати
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={isUpdating}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            className="hover:shadow-lg transition-shadow duration-200"
                          >
                            Видалити
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCategory}
          isLoading={isUpdating}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={handleEditCategory}
          isLoading={isUpdating}
        />
      )}
    </div>
  )
}