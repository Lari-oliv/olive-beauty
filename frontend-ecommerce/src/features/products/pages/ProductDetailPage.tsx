import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from '@tanstack/react-router'
import { Product, ProductVariant } from '@/shared/types'
import { productsApi } from '@/api/endpoints/products'
import { useCartStore } from '@/shared/stores'
import { useFavoritesStore } from '@/shared/stores'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ProductImageGallery } from '../components/ProductImageGallery'
import { ProductInfo } from '../components/ProductInfo'
import { VariantSelector } from '../components/VariantSelector'
import { QuantitySelector } from '../components/QuantitySelector'
import { ProductActions } from '../components/ProductActions'
import { ProductSpecifications } from '../components/ProductSpecifications'
import { RelatedProducts } from '../components/RelatedProducts'
import { hasFreeShipping } from '@/shared/lib/utils'

export function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' })
  const navigate = useNavigate()
  const { addItem, isLoading: cartLoading } = useCartStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para criar dados mockados como fallback
  const createMockProduct = (id: string): Product => {
    return {
      id,
      name: 'Produto de Exemplo',
      description: 'Este é um produto de exemplo com descrição detalhada. Perfeito para demonstrar as funcionalidades da página de detalhes.',
      basePrice: 99.90,
      brand: 'Olive Beauty',
      categoryId: 'mock-category',
      category: {
        id: 'mock-category',
        name: 'Maquiagem',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      variants: [
        {
          id: 'mock-variant-1',
          productId: id,
          attributes: JSON.stringify({ cor: 'Vermelho', tamanho: '50ml' }),
          price: 99.90,
          stock: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'mock-variant-2',
          productId: id,
          attributes: JSON.stringify({ cor: 'Azul', tamanho: '50ml' }),
          price: 99.90,
          stock: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      images: [
        {
          id: 'mock-image-1',
          productId: id,
          url: 'https://via.placeholder.com/600x600?text=Produto+1',
          isCover: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock-image-2',
          productId: id,
          url: 'https://via.placeholder.com/600x600?text=Produto+2',
          isCover: false,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let productData: Product
        
        try {
          // Tentar buscar da API
          productData = await productsApi.getById(productId)
        } catch (apiError) {
          // Fallback para dados mockados se API falhar
          console.warn('API não disponível, usando dados mockados:', apiError)
          productData = createMockProduct(productId)
        }
        
        setProduct(productData)
        
        // Set first variant as default if available
        if (productData.variants && productData.variants.length > 0) {
          // Preferir variante com estoque, mas usar a primeira se nenhuma tiver estoque
          const variantWithStock = productData.variants.find(v => v.stock > 0)
          setSelectedVariant(variantWithStock || productData.variants[0])
        } else {
          setSelectedVariant(null)
        }

        // Fetch related products (same category)
        if (productData.categoryId) {
          try {
            const related = await productsApi.getAll({
              categoryId: productData.categoryId,
              sortBy: 'createdAt',
            })
            setRelatedProducts(related.filter((p) => p.id !== productId).slice(0, 6))
          } catch (err) {
            // Silently fail related products - não é crítico
            console.warn('Erro ao buscar produtos relacionados:', err)
            setRelatedProducts([])
          }
        } else {
          setRelatedProducts([])
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        // Usar dados mockados como último recurso
        const mockProduct = createMockProduct(productId)
        setProduct(mockProduct)
        if (mockProduct.variants && mockProduct.variants.length > 0) {
          const variantWithStock = mockProduct.variants.find(v => v.stock > 0)
          setSelectedVariant(variantWithStock || mockProduct.variants[0])
        } else {
          setSelectedVariant(null)
        }
        setRelatedProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Validar variante selecionada quando produto ou variantes mudarem
  useEffect(() => {
    if (product && selectedVariant) {
      // Verificar se a variante selecionada ainda existe nas variantes do produto
      const variantExists = product.variants?.some(v => v.id === selectedVariant.id)
      if (!variantExists) {
        // Se não existe, selecionar a primeira variante disponível
        if (product.variants && product.variants.length > 0) {
          const variantWithStock = product.variants.find(v => v.stock > 0)
          setSelectedVariant(variantWithStock || product.variants[0])
        } else {
          setSelectedVariant(null)
        }
      }
    } else if (product && !selectedVariant && product.variants && product.variants.length > 0) {
      // Se não há variante selecionada mas há variantes disponíveis, selecionar a primeira
      const variantWithStock = product.variants.find(v => v.stock > 0)
      setSelectedVariant(variantWithStock || product.variants[0])
    }
  }, [product, selectedVariant])

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite(productId)) {
        await removeFavorite(productId)
      } else {
        await addFavorite(productId)
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      await addItem({
        productId: product.id,
        productVariantId: selectedVariant?.id,
        quantity,
      })
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    // Navegar para o carrinho após adicionar
    setTimeout(() => {
      navigate({ to: '/cart' })
    }, 500)
  }

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setQuantity(1) // Reset quantity when variant changes
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-6">
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-16 bg-muted rounded" />
              <div className="h-12 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Produto não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Link to="/products" search={{ categoryId: undefined, search: undefined, brand: undefined, minPrice: undefined, maxPrice: undefined, sortBy: undefined }}>
          <Button size="lg">Voltar para Produtos</Button>
        </Link>
      </div>
    )
  }

  const images = product.images || []
  const currentPrice = selectedVariant?.price || product.basePrice
  const currentStock = selectedVariant?.stock ?? (product.variants?.[0]?.stock ?? 0)
  const hasStock = currentStock > 0
  const maxQuantity = hasStock ? currentStock : 0
  const freeShipping = hasFreeShipping(currentPrice)

  return (
    <div className="container py-6 md:py-8 space-y-8 max-w-7xl mx-auto">
      {/* Layout Principal - Estilo Mercado Livre */}
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 lg:gap-12">
        {/* Coluna Esquerda - Galeria de Imagens (60% largura desktop) */}
        <div className="sticky top-4 self-start">
          <ProductImageGallery
            images={images}
            productName={product.name}
            hasFreeShipping={freeShipping}
          />
        </div>

        {/* Coluna Direita - Informações do Produto (40% largura desktop) */}
        <div className="space-y-6">
          <ProductInfo
            product={product}
            currentPrice={currentPrice}
            currentStock={currentStock}
          />

          {/* Variantes */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={handleSelectVariant}
            />
          )}

          {/* Quantidade e Ações */}
          {hasStock && (
            <QuantitySelector
              quantity={quantity}
              maxQuantity={maxQuantity}
              onIncrease={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isAddingToCart || cartLoading}
            />
          )}

          <ProductActions
            hasStock={hasStock}
            isAddingToCart={isAddingToCart}
            isFavorite={isFavorite(productId)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleFavorite={handleToggleFavorite}
            cartLoading={cartLoading}
          />
        </div>
      </div>

      {/* Seção Inferior - Descrição, Especificações e Informações Adicionais */}
      <div className="space-y-8">
        {/* Descrição do Produto */}
        {product.description && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Descrição</h2>
              <div className="prose prose-sm max-w-none">
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">
                  {product.description}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Especificações */}
        <ProductSpecifications product={product} />

        {/* Informações Adicionais - Estilo Mercado Livre */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Informações de Compra</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <h3 className="font-semibold text-lg">Frete</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {freeShipping
                    ? 'Frete grátis para todo o Brasil'
                    : 'Calcule o frete no checkout'}
                </p>
                {freeShipping && (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Produto elegível para frete grátis
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <h3 className="font-semibold text-lg">Devolução</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Devolução grátis em até 7 dias após o recebimento
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <h3 className="font-semibold text-lg">Garantia</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Garantia de 90 dias contra defeitos de fabricação
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <h3 className="font-semibold text-lg">Pagamento</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cartão de Crédito, PIX, Boleto Bancário
                </p>
                <p className="text-xs text-muted-foreground">
                  Parcelamento em até 10x sem juros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <RelatedProducts 
            products={relatedProducts}
            title="Quem viu este produto também viu"
          />
        )}
      </div>
    </div>
  )
}
