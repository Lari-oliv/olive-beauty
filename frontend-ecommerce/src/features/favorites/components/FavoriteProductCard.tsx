import { Link } from '@tanstack/react-router'
import { Favorite } from '@/shared/types'
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useCartStore } from '@/shared/stores'
import { useState } from 'react'

interface FavoriteProductCardProps {
  favorite: Favorite
  onRemove: () => void
}

export function FavoriteProductCard({ favorite, onRemove }: FavoriteProductCardProps) {
  const { addItem, isLoading: cartLoading } = useCartStore()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const product = favorite.product
  if (!product) return null

  const coverImage = product.images?.find((img) => img.isCover) || product.images?.[0]
  const minPrice =
    product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : product.basePrice

  const hasStock = product.variants?.some((v) => v.stock > 0) ?? true

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const { useAuthStore } = await import('@/shared/stores')
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      const { savePendingAction } = await import('@/shared/utils/pendingActions')
      const variant = product.variants?.[0]
      savePendingAction({
        type: 'addToCart',
        productId: product.id,
        productVariantId: variant?.id,
        quantity: 1,
        url: window.location.pathname,
      })
      window.location.href = '/login'
      return
    }

    setIsAddingToCart(true)
    try {
      // Use first variant if available, otherwise use product without variant
      const variant = product.variants?.[0]
      await addItem({
        productId: product.id,
        productVariantId: variant?.id,
        quantity: 1,
      })
      // Open cart sheet after successful add
      const { useCartSheetStore } = await import('@/shared/stores')
      useCartSheetStore.getState().open()
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove()
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
      <Link to="/products/$productId" params={{ productId: product.id }}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            {product.brand && (
              <Badge variant="secondary" className="text-xs">
                {product.brand}
              </Badge>
            )}
            <h3 className="font-semibold line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-2xl font-bold text-primary">
              R$ {minPrice.toFixed(2).replace('.', ',')}
            </p>
            {!hasStock && (
              <p className="text-sm text-destructive">Sem estoque</p>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 space-y-2 flex-col">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!hasStock || isAddingToCart || cartLoading}
        >
          {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleRemove}
        >
          Remover dos Favoritos
        </Button>
      </CardFooter>
    </Card>
  )
}

