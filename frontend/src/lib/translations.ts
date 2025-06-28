// Simple translation utility for the application

// Define translation keys and their values
const translations = {
  // Auth
  'auth.login.title': 'Увійдіть до вашого акаунту',
  'auth.login.button': 'Увійти',
  'auth.register.title': 'Створіть ваш акаунт',
  'auth.register.button': 'Зареєструватися',
  'auth.logout': 'Вийти',
  'auth.email': 'Електронна пошта',
  'auth.password': 'Пароль',
  'auth.confirmPassword': 'Підтвердіть пароль',
  'auth.fullName': 'Повне ім\'я',
  'auth.forgotPassword': 'Забули пароль?',
  'auth.resendConfirmation': 'Повторити підтвердження',
  
  // Validation
  'validation.required': 'Це поле обов\'язкове',
  'validation.email': 'Будь ласка, введіть дійсну адресу електронної пошти',
  'validation.minLength': 'Мінімальна довжина: {0} символів',
  'validation.passwordMatch': 'Паролі не співпадають',
  
  // Common
  'common.loading': 'Завантаження...',
  'common.error': 'Помилка',
  'common.success': 'Успішно',
  'common.save': 'Зберегти',
  'common.cancel': 'Скасувати',
  'common.delete': 'Видалити',
  'common.edit': 'Редагувати',
  'common.view': 'Переглянути',
  'common.back': 'Назад',
  'common.next': 'Далі',
  'common.search': 'Пошук',
  'common.filter': 'Фільтр',
  'common.all': 'Всі',
  'common.none': 'Немає',
  'common.yes': 'Так',
  'common.no': 'Ні',
  
  // Dishes
  'dishes.title': 'Страви',
  'dishes.add': 'Додати страву',
  'dishes.edit': 'Редагувати страву',
  'dishes.delete': 'Видалити страву',
  'dishes.ingredients': 'Інгредієнти',
  'dishes.steps': 'Кроки приготування',
  'dishes.categories': 'Категорії',
  'dishes.servings': 'Порції',
  'dishes.cookingTime': 'Час приготування',
  'dishes.nutrition': 'Поживна цінність',
  'dishes.calories': 'Калорії',
  'dishes.protein': 'Білки',
  'dishes.fat': 'Жири',
  'dishes.carbs': 'Вуглеводи',
  
  // Profile
  'profile.title': 'Профіль',
  'profile.settings': 'Налаштування',
  'profile.changePassword': 'Змінити пароль',
  'profile.avatar': 'Аватар',
  'profile.myDishes': 'Мої страви',
  'profile.myCollections': 'Мої колекції',
  
  // Admin
  'admin.title': 'Адміністрування',
  'admin.users': 'Користувачі',
  'admin.categories': 'Категорії',
  'admin.dishes': 'Страви',
  'admin.comments': 'Коментарі',
  'admin.ratings': 'Рейтинги',
  
  // Errors
  'error.notFound': 'Не знайдено',
  'error.unauthorized': 'Необхідна авторизація',
  'error.forbidden': 'Доступ заборонено',
  'error.serverError': 'Помилка сервера',
  'error.networkError': 'Помилка мережі',
  'error.unknown': 'Невідома помилка'
};

// Translation function
export function t(key: string, params?: Record<string, string | number>): string {
  let translation = translations[key as keyof typeof translations] || key;
  
  // Replace parameters if provided
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translation = translation.replace(`{${paramKey}}`, String(paramValue));
    });
  }
  
  return translation;
}

// Format function for pluralization (Ukrainian)
export function formatPlural(count: number, forms: [string, string, string]): string {
  const remainder10 = count % 10;
  const remainder100 = count % 100;
  
  if (remainder10 === 1 && remainder100 !== 11) {
    return forms[0]; // singular form
  } else if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 10 || remainder100 >= 20)) {
    return forms[1]; // few form
  } else {
    return forms[2]; // many form
  }
}

// Example usage:
// t('dishes.title')
// t('validation.minLength', { 0: 6 })
// formatPlural(5, ['страва', 'страви', 'страв']) => 'страв'