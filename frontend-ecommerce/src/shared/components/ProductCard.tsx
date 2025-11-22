import { Link } from '@tanstack/react-router'
import { Product } from '@/shared/types'
import { Card, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useCartStore, useAuthStore, useCartSheetStore } from '@/shared/stores'
import { useFavoritesStore } from '@/shared/stores'
import { useState } from 'react'
import { calculateInstallment, getStockStatus, formatCurrency } from '@/shared/lib/utils'

interface ProductCardProps {
  product: Product
}

// Mock data para avaliações (será substituído por dados reais quando disponível)
function getMockRating(productId: string): { rating: number; reviewCount: number } {
  // Gera valores consistentes baseados no ID do produto
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rating = 3.5 + (hash % 15) / 10 // Entre 3.5 e 5.0
  const reviewCount = (hash % 200) + 10 // Entre 10 e 210
  
  return {
    rating: Math.round(rating * 10) / 10,
    reviewCount,
  }
}

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  const gradientId = `half-star-${rating}-${reviewCount}`

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id={gradientId}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gradientId})`}
              d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
            />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-1">
        ({reviewCount})
      </span>
    </div>
  )
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading: cartLoading } = useCartStore()
  const { isFavorite, addFavorite, removeFavorite, isLoading: favoriteLoading } = useFavoritesStore()
  const { open: openCartSheet } = useCartSheetStore()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const coverImage = product.images?.find(img => img.isCover) || product.images?.[0]
  const minPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price))
    : product.basePrice

  // Calcular estoque total
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0
  const stockStatus = getStockStatus(totalStock)
  const installment = calculateInstallment(minPrice)
  
  // Mock de avaliações (será substituído por dados reais)
  const { rating, reviewCount } = getMockRating(product.id)
  
  // Frete grátis para produtos acima de R$ 100
  const hasFreeShipping = minPrice >= 100

  const isFav = isFavorite(product.id)
  const hasStock = totalStock > 0

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      const { savePendingAction } = await import('@/shared/utils/pendingActions')
      savePendingAction({
        type: 'addToFavorites',
        productId: product.id,
        url: window.location.pathname,
      })
      window.location.href = '/login'
      return
    }

    try {
      if (isFav) {
        await removeFavorite(product.id)
      } else {
        await addFavorite(product.id)
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
      const variant = product.variants?.[0]
      await addItem({
        productId: product.id,
        productVariantId: variant?.id,
        quantity: 1,
      })
      // Open cart sheet after successful add
      openCartSheet()
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border hover:border-primary/30 flex flex-col h-full relative">
      {/* Imagem com badges */}
      <Link to="/products/$productId" params={{ productId: product.id }}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}
          
          {/* Badge Frete Grátis */}
          {hasFreeShipping && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs font-semibold">
                Frete Grátis
              </Badge>
            </div>
          )}
          
          {/* Botão Favorito */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
            disabled={favoriteLoading}
            aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isFav ? 'text-red-500' : 'text-foreground'}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Conteúdo */}
      <CardContent className="p-3 flex-1 flex flex-col pb-3">
        <Link to="/products/$productId" params={{ productId: product.id }}>
          <div className="space-y-2 flex-1">
            {/* Marca */}
            {product.brand && (
              <Badge variant="secondary" className="text-xs w-fit">
                {product.brand}
              </Badge>
            )}
            
            {/* Título */}
            <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
            
            {/* Avaliações */}
            {reviewCount > 0 && (
              <RatingStars rating={rating} reviewCount={reviewCount} />
            )}
            
            {/* Preço */}
            <div>
              <p className="text-xl font-bold text-primary group-hover:scale-105 transition-transform duration-200 inline-block">
                {formatCurrency(minPrice)}
              </p>
              
              {/* Parcelamento */}
              {installment && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {installment}
                </p>
              )}
            </div>
            
            {/* Status do Estoque */}
            <Badge variant={stockStatus.variant} className="text-xs w-fit">
              {stockStatus.label}
            </Badge>
          </div>
        </Link>
      </CardContent>

      {/* Botão Adicionar ao Carrinho - overlay que aparece no hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto shadow-lg">
        <Button
          className="w-full text-sm h-9 transition-all duration-200 hover:scale-105 active:scale-95"
          onClick={handleAddToCart}
          disabled={!hasStock || isAddingToCart || cartLoading}
        >
          {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </Card>
  )
}

