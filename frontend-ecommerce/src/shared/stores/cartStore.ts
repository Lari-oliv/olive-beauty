import { create } from 'zustand'
import { Cart, CartItem, AddToCartDTO, UpdateCartItemDTO } from '@/shared/types'
import { apiClient } from '@/api/client'
import { ApiResponse } from '@/shared/types'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  error: string | null
  itemCount: number
  getCart: () => Promise<void>
  addItem: (data: AddToCartDTO) => Promise<void>
  updateItem: (itemId: string, data: UpdateCartItemDTO) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  clearError: () => void
  lastAddedItemId: string | null
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,
  lastAddedItemId: null,

  getCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<ApiResponse<Cart>>('/cart')

      if (response.data.status === 'success' && response.data.data) {
        const cart = response.data.data
        set({
          cart,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error(response.data.message || 'Erro ao buscar carrinho')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar carrinho. Tente novamente.'
      set({ error: errorMessage, isLoading: false })
    }
  },

  addItem: async (data: AddToCartDTO) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<ApiResponse<Cart>>(
        '/cart/items',
        data
      )

      if (response.data.status === 'success' && response.data.data) {
        const cart = response.data.data
        // Find the newly added item (last item in the array)
        const lastItem = cart.items[cart.items.length - 1]
        set({
          cart,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          isLoading: false,
          error: null,
          lastAddedItemId: lastItem?.id || null,
        })
      } else {
        throw new Error(response.data.message || 'Erro ao adicionar item')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao adicionar item ao carrinho. Tente novamente.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateItem: async (itemId: string, data: UpdateCartItemDTO) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put<ApiResponse<Cart>>(
        `/cart/items/${itemId}`,
        data
      )

      if (response.data.status === 'success' && response.data.data) {
        const cart = response.data.data
        set({
          cart,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar item')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar item. Tente novamente.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.delete<ApiResponse<Cart>>(
        `/cart/items/${itemId}`
      )

      if (response.data.status === 'success' && response.data.data) {
        const cart = response.data.data
        set({
          cart,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error(response.data.message || 'Erro ao remover item')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao remover item. Tente novamente.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.delete<ApiResponse<{ message: string }>>('/cart')

      set({
        cart: null,
        itemCount: 0,
        isLoading: false,
        error: null,
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao limpar carrinho. Tente novamente.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

