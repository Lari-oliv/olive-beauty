import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from '@/shared/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    const currentPath = window.location.pathname
    
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (status === 401) {
      // Prevent multiple redirects
      if (currentPath === '/login' || currentPath.startsWith('/login') || currentPath === '/register') {
        return Promise.reject(error)
      }
      
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Clear auth store state - use dynamic import to avoid circular dependencies
      import('@/shared/stores').then(({ useAuthStore }) => {
        useAuthStore.getState().logout()
      }).catch(() => {
        // Store not available yet, will be cleared on next load
      })
      
      // Use replace to avoid adding to history and prevent loops
      window.location.replace('/login')
      return Promise.reject(error)
    }

    // Handle 403 Forbidden
    if (status === 403) {
      // Prevent multiple redirects
      if (currentPath === '/login' || currentPath.startsWith('/login')) {
        return Promise.reject(error)
      }
      
      console.error('Access forbidden')
    }

    return Promise.reject(error)
  }
)

export default apiClient
