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
  ChefHat,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function AdminCategoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  
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
  const avgDishesPerCategory = categories.length > 0 ? Math.round(totalDishes / categories.length) : 0
  const todayCategories = categories.filter(cat => {
    const today = new Date().toDateString()
    const catDate = new Date(cat.created_at).toDateString()
    return today === catDate
  }).length

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 relative overflow-hidden rounded-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Admin Icon */}
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              
              <div>
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Управління категоріями
                  <Settings className="inline-block w-8 h-8 ml-3 text-yellow-300" />
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg text-white/90">
                  Керуйте категоріями рецептів та їх організацією
                </p>
              </div>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-50 shadow-lg"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Створити категорію
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Grid3X3 className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Всього категорій</p>
                <p className="text-3xl font-bold text-blue-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Всього рецептів</p>
                <p className="text-3xl font-bold text-green-900">{totalDishes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Середньо на категорію</p>
                <p className="text-3xl font-bold text-purple-900">{avgDishesPerCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Створено сьогодні</p>
                <p className="text-3xl font-bold text-orange-900">{todayCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Пошук категорій за назвою або описом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="text-lg py-3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'table' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                leftIcon={<BarChart3 className="w-4 h-4" />}
              >
                Таблиця
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                leftIcon={<Grid3X3 className="w-4 h-4" />}
              >
                Сітка
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800 font-medium">
              Знайдено {filteredCategories.length} категорій за запитом "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {/* Categories Content */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="flex items-center text-xl">
            <Grid3X3 className="w-6 h-6 mr-3 text-primary-600" />
            Список категорій
            <span className="ml-auto bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
              {filteredCategories.length} категорій
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 text-lg">Завантаження категорій...</p>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📂</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchQuery ? 'Категорії не знайдено' : 'Немає категорій'}
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {searchQuery 
                  ? 'Спробуйте інший пошуковий запит'
                  : 'Створіть першу категорію для організації рецептів'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Створити категорію
                </Button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Категорія
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
                      Статус
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary-100 rounded-lg mr-3">
                            <Grid3X3 className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {category.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {category.description ? (
                            <span className="line-clamp-2">{category.description}</span>
                          ) : (
                            <span className="text-gray-400 italic">Без опису</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (category.dishes_count || 0) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <Hash className="w-3 h-3 mr-1" />
                            {category.dishes_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(category.created_at)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatRelativeTime(category.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Активна
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                            leftIcon={<Edit className="w-4 h-4" />}
                            disabled={isUpdating}
                          >
                            Редагувати
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={isUpdating || (category.dishes_count || 0) > 0}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            title={(category.dishes_count || 0) > 0 ? 'Неможливо видалити категорію з рецептами' : ''}
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
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary-100 rounded-lg">
                          <Grid3X3 className="w-6 h-6 text-primary-600" />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Активна
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description || 'Без опису'}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Рецептів:</span>
                          <span className="font-medium">{category.dishes_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Створено:</span>
                          <span className="font-medium">{formatRelativeTime(category.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                          leftIcon={<Edit className="w-4 h-4" />}
                          disabled={isUpdating}
                          className="flex-1"
                        >
                          Редагувати
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          disabled={isUpdating || (category.dishes_count || 0) > 0}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          title={(category.dishes_count || 0) > 0 ? 'Неможливо видалити категорію з рецептами' : ''}
                        >
                          Видалити
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      {!searchQuery && categories.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="w-6 h-6 mr-3 text-primary-600" />
              Детальна статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {categories.filter(cat => (cat.dishes_count || 0) > 0).length}
                </div>
                <div className="text-gray-600 font-medium">Активних категорій</div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.round((categories.filter(cat => (cat.dishes_count || 0) > 0).length / categories.length) * 100)}% від загальної кількості
                </div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {categories.filter(cat => (cat.dishes_count || 0) === 0).length}
                </div>
                <div className="text-gray-600 font-medium">Порожніх категорій</div>
                <div className="text-sm text-gray-500 mt-1">
                  Потребують наповнення рецептами
                </div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.max(...categories.map(cat => cat.dishes_count || 0), 0)}
                </div>
                <div className="text-gray-600 font-medium">Найпопулярніша</div>
                <div className="text-sm text-gray-500 mt-1">
                  Максимальна кількість рецептів
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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