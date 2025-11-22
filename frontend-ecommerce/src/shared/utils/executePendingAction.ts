import { PendingAction, getAndClearPendingAction } from './pendingActions'
import { productsApi } from '@/api/endpoints/products'

/**
 * Execute a pending action after user logs in
 */
export async function executePendingAction(
  action: PendingAction,
  onSuccess: (message: string) => void,
  onError: (message: string) => void
): Promise<void> {
  try {
    // Fetch product to validate stock and variant
    const product = await productsApi.getById(action.productId)

    if (!product) {
      onError('Produto não encontrado')
      return
    }

    // Validate variant if provided
    if (action.productVariantId) {
      const variant = product.variants?.find(v => v.id === action.productVariantId)
      if (!variant) {
        onError('Variante não está disponível')
        return
      }
      if (variant.stock <= 0) {
        onError('Produto esgotado')
        return
      }
      if (action.quantity && action.quantity > variant.stock) {
        onError('Quantidade solicitada maior que o estoque disponível')
        return
      }
    } else {
      // Check if product has any stock
      const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0
      if (totalStock <= 0) {
        onError('Produto esgotado')
        return
      }
    }

    // Import stores dynamically to avoid circular dependencies
    const { useCartStore } = await import('@/shared/stores')
    const { useFavoritesStore } = await import('@/shared/stores')

    // Execute the action
    switch (action.type) {
      case 'addToCart':
      case 'buyNow': {
        const { addItem } = useCartStore.getState()
        const variant = action.productVariantId
          ? product.variants?.find(v => v.id === action.productVariantId)
          : product.variants?.[0]

        await addItem({
          productId: product.id,
          productVariantId: variant?.id,
          quantity: action.quantity || 1,
        })

        // Open cart sheet for addToCart (not for buyNow)
        if (action.type === 'addToCart') {
          const { useCartSheetStore } = await import('@/shared/stores')
          useCartSheetStore.getState().open()
        }

        onSuccess('Produto adicionado ao carrinho')
        break
      }

      case 'addToFavorites': {
        const { addFavorite } = useFavoritesStore.getState()
        await addFavorite(product.id)
        onSuccess('Produto adicionado aos favoritos')
        break
      }
    }
  } catch (error) {
    console.error('Error executing pending action:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao executar ação'
    onError(errorMessage)
  }
}

/**
 * Check and execute pending action after login
 */
export async function checkAndExecutePendingAction(
  onSuccess: (message: string) => void,
  onError: (message: string) => void
): Promise<string | null> {
  const pendingAction = getAndClearPendingAction()
  
  if (!pendingAction) {
    return null
  }

  try {
    await executePendingAction(pendingAction, onSuccess, onError)
    
    // Return redirect URL based on action type
    if (pendingAction.type === 'buyNow') {
      // For buyNow, redirect to checkout
      return '/checkout'
    } else if (pendingAction.type === 'addToCart') {
      // For addToCart, don't redirect - sheet will be opened
      return null
    } else {
      // For other actions (favorites), redirect back to product page
      return pendingAction.url
    }
  } catch (error) {
    console.error('Error in checkAndExecutePendingAction:', error)
    // On error, still redirect to product page
    return pendingAction.url
  }
}

