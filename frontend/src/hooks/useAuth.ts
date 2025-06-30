import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { LoginCredentials, RegisterData } from '@/types/auth'

export function useAuth() {
  const { 
    login: storeLogin, 
    register: storeRegister, 
    logout: storeLogout, 
    verifyToken, 
    refreshToken,
    isLoading,
    isAuthenticated,
    user
  } = useAuthStore()
  
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const login = async (credentials: LoginCredentials) => {
    const result = await storeLogin(credentials)
    
    if (result.success) {
      toast.success('З поверненням!')
      return { success: true }
    } else {
      // Show specific error message for email confirmation
      if (result.error === 'Email not confirmed' || result.message?.includes('підтвердіть')) {
        toast.error(result.message || 'Будь ласка, підтвердіть свою електронну пошту перед входом')
        // Show additional help
        setTimeout(() => {
          toast('Не отримали лист? Перевірте папку "Спам" або надішліть повторно', {
            icon: '📧',
            duration: 5000
          })
        }, 1000)
      } else {
        toast.error(result.message || result.error || 'Помилка входу')
      }
      return { success: false, error: result.error, message: result.message }
    }
  }

  const register = async (data: RegisterData) => {
    const result = await storeRegister(data)
    
    if (result.success) {
      if (result.requiresEmailConfirmation) {
        toast.success('Реєстрація успішна! Будь ласка, перевірте вашу електронну пошту для підтвердження.')
        setTimeout(() => {
          toast('Вам також надіслано вітальний лист!', {
            icon: '📧',
            duration: 3000
          })
        }, 1000)
      } else {
        toast.success('Реєстрація успішна! Вам надіслано вітальний лист. Тепер ви можете увійти.')
      }
      return { success: true, requiresEmailConfirmation: result.requiresEmailConfirmation }
    } else {
      toast.error(result.error || 'Помилка реєстрації')
      return { success: false, error: result.error, message: result.message }
    }
  }

  const logout = async () => {
    await storeLogout()
    toast.success('Ви вийшли з системи')
    return { success: true }
  }

  const resendConfirmation = async (email: string) => {
    setIsResendingConfirmation(true)
    try {
      const response = await apiClient.post('/auth/resend-confirmation', { email })
      
      if (response.success) {
        toast.success('Лист підтвердження надіслано!')
        return { success: true, message: response.message }
      } else {
        toast.error(response.message || 'Помилка відправки листа')
        return { success: false, error: response.error, message: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Помилка відправки листа'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsResendingConfirmation(false)
    }
  }

  const forgotPassword = async (email: string) => {
    setIsForgotPassword(true)
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      
      if (response.success) {
        toast.success('Інструкції для скидання пароля надіслано на вашу електронну пошту')
        return { success: true, message: response.message }
      } else {
        toast.error(response.message || 'Помилка відправки листа для скидання пароля')
        return { success: false, error: response.error, message: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Помилка відправки листа для скидання пароля'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsForgotPassword(false)
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password })
      
      if (response.success) {
        toast.success('Пароль успішно змінено! Тепер ви можете увійти з новим паролем.')
        return { success: true }
      } else {
        toast.error(response.message || 'Помилка скидання пароля')
        return { success: false, error: response.error, message: response.message }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Помилка скидання пароля'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    login,
    register,
    logout,
    resendConfirmation,
    forgotPassword,
    resetPassword,
    verifyToken,
    refreshToken,
    isLoading,
    isResendingConfirmation,
    isForgotPassword,
    isAuthenticated,
    user
  }
}