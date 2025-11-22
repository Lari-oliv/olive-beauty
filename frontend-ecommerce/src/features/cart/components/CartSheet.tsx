import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { useCartStore, useCartSheetStore } from '@/shared/stores'
import { CartItem } from '@/shared/types'
import { formatCurrency } from '@/shared/lib/utils'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateItem } = useCartStore()
  const product = item.product
  const variant = item.productVariant
  const coverImage = product?.images?.find(img => img.isCover) || product?.images?.[0]
  
  const price = variant?.price || product?.basePrice || 0
  const itemTotal = price * item.quantity

  const parseAttributes = (attributes: string) => {
    try {
      return JSON.parse(attributes)
    } catch {
      return {}
    }
  }

  const variantAttributes = variant ? parseAttributes(variant.attributes) : {}

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(item.id)
      return
    }
    
    if (variant && newQuantity > variant.stock) {
      return
    }
    
    try {
      await updateItem(item.id, { quantity: newQuantity })
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
    }
  }

  const handleRemove = async () => {
    try {
      await removeItem(item.id)
    } catch (error) {
      console.error('Erro ao remover item:', error)
    }
  }

  return (
    <div className="flex gap-3 py-4 border-b last:border-b-0">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {coverImage ? (
          <img
            src={coverImage.url}
            alt={product?.name || 'Produto'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2 mb-1">
          {product?.name || 'Produto'}
        </h4>
        
        {/* Variant attributes */}
        {Object.keys(variantAttributes).length > 0 && (
          <p className="text-xs text-muted-foreground mb-2">
            {Object.entries(variantAttributes).map(([key, value]) => (
              <span key={key} className="mr-2">
                <strong className="capitalize">{key}:</strong> {String(value)}
              </span>
            ))}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="px-2 py-1 hover:bg-muted transition-colors"
                aria-label="Diminuir quantidade"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={variant ? item.quantity >= variant.stock : false}
                className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Aumentar quantidade"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              aria-label="Remover item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-sm">{formatCurrency(itemTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(price)} cada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const navigate = useNavigate()
  const { cart, getCart } = useCartStore()

  // Refresh cart when sheet opens
  useEffect(() => {
    if (open) {
      getCart()
    } else {
      // Clear lastAddedItemId when sheet closes
      const { lastAddedItemId } = useCartStore.getState()
      if (lastAddedItemId) {
        useCartStore.setState({ lastAddedItemId: null })
      }
    }
  }, [open, getCart])

  const calculateSubtotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      const price = item.productVariant?.price || item.product?.basePrice || 0
      return total + price * item.quantity
    }, 0)
  }

  const handleGoToCart = () => {
    onOpenChange(false)
    navigate({ to: '/cart' })
  }

  const handleCheckout = () => {
    onOpenChange(false)
    navigate({ to: '/checkout' })
  }

  const handleContinueShopping = () => {
    onOpenChange(false)
  }

  // Sort items: newest first
  // Use lastAddedItemId to ensure the newly added item is at the top
  // Backend already orders by createdAt desc, but we prioritize lastAddedItemId
  const { lastAddedItemId } = useCartStore.getState()
  const sortedItems = cart?.items ? [...cart.items].sort((a, b) => {
    // If we have a lastAddedItemId, prioritize it to be at the top
    if (lastAddedItemId) {
      if (a.id === lastAddedItemId) return -1
      if (b.id === lastAddedItemId) return 1
    }
    // Backend already orders by createdAt desc, so we can keep the order
    return 0
  }) : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-left">Carrinho</SheetTitle>
        </SheetHeader>

        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-muted-foreground mb-4"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-muted-foreground">Seu carrinho está vazio</p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items List with Scroll */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-4">
                {sortedItems.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Subtotal and Actions */}
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Subtotal:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(calculateSubtotal())}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleContinueShopping}
                >
                  Continuar comprando
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleGoToCart}
                  >
                    Ir para o carrinho
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                  >
                    Finalizar compra
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

