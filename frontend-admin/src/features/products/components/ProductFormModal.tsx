import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Product, CreateProductDTO, UpdateProductDTO, Category } from '@/shared/types'
import { ImageManager } from './ImageManager'
import { VariantFormModal, ProductVariant } from './VariantFormModal'
import { formatCurrency } from '@/shared/lib/utils'
import { productsApi } from '@/api/endpoints/products'

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateProductDTO | UpdateProductDTO) => Promise<void>
  product?: Product | null
  categories: Category[]
  isLoading?: boolean
}

export function ProductFormModal({
  open,
  onOpenChange,
  onSubmit,
  product,
  categories,
  isLoading = false,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    brand: '',
    categoryId: '',
  })
  const [images, setImages] = useState<Array<{ url: string; isCover: boolean }>>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [errors, setErrors] = useState<{
    name?: string
    basePrice?: string
    categoryId?: string
  }>({})

  // Variant modal state
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
  const [removeVariantIndex, setRemoveVariantIndex] = useState<number | null>(null)
  const [fullProduct, setFullProduct] = useState<Product | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  useEffect(() => {
    console.log('variants', variants)
  }, [variants]);

  // Fetch full product data when editing
  useEffect(() => {
    if (open && product?.id) {
      setIsLoadingProduct(true)
      productsApi
        .getById(product.id)
        .then((data) => {
          setFullProduct(data)
        })
        .catch((error) => {
          console.error('Erro ao carregar produto completo:', error)
          // Fallback para o produto da lista se houver erro
          setFullProduct(product)
        })
        .finally(() => {
          setIsLoadingProduct(false)
        })
    } else if (!open) {
      setFullProduct(null)
    }
  }, [open, product])

  useEffect(() => {
    const productToUse = fullProduct || product
    if (productToUse) {
      setFormData({
        name: productToUse.name || '',
        description: productToUse.description || '',
        basePrice: productToUse.basePrice?.toString() || '',
        brand: productToUse.brand || '',
        categoryId: productToUse.category?.id || '',
      })
      setImages(
        productToUse.images?.filter(img => !img.productVariantId).map((img) => ({
          url: img.url,
          isCover: img.isCover,
        })) || []
      )
      setVariants(
        productToUse.variants?.map((v) => ({
          attributes: typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes,
          price: v.price,
          stock: v.stock,
          images: v.images && v.images.length > 0 ? v.images.map(img => ({
            url: img.url,
            isCover: img.isCover
          })) : undefined, // Include variant images
        })) || []
      )
    } else {
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        brand: '',
        categoryId: '',
      })
      setImages([])
      setVariants([])
    }
    setErrors({})
  }, [fullProduct, product])

  const validate = (): boolean => {
    const newErrors: { name?: string; basePrice?: string; categoryId?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    const basePriceNum = parseFloat(formData.basePrice)
    if (!formData.basePrice || isNaN(basePriceNum) || basePriceNum <= 0) {
      newErrors.basePrice = 'Preço base deve ser um número positivo'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      let submitData: CreateProductDTO | UpdateProductDTO

      // Sort images: cover first, then others
      const sortedImages = [...images].sort((a, b) => {
        if (a.isCover) return -1
        if (b.isCover) return 1
        return 0
      })

      if (product) {
        // Update - only send changed fields
        submitData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          basePrice: parseFloat(formData.basePrice),
          brand: formData.brand.trim() || undefined,
          categoryId: formData.categoryId,
          variants: variants.length > 0 ? variants : undefined,
          images: sortedImages.length > 0 ? sortedImages.map((img) => img.url) : undefined,
        }
      } else {
        // Create - include variants and images
        submitData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          basePrice: parseFloat(formData.basePrice),
          brand: formData.brand.trim() || undefined,
          categoryId: formData.categoryId,
          variants: variants.length > 0 ? variants : undefined,
          images: sortedImages.length > 0 ? sortedImages.map((img) => img.url) : undefined,
        }
      }

      await onSubmit(submitData)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleAddImage = (url: string) => {
    setImages([...images, { url, isCover: images.length === 0 }])
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // If we removed the cover, make the first one the cover
    if (images[index].isCover && newImages.length > 0) {
      newImages[0].isCover = true
    }
    setImages(newImages)
  }

  const handleSetCover = (index: number) => {
    setImages(
      images.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    )
  }

  const handleAddVariant = (variant: ProductVariant) => {
    if (editingVariantIndex !== null) {
      const newVariants = [...variants]
      newVariants[editingVariantIndex] = variant
      setVariants(newVariants)
      setEditingVariantIndex(null)
    } else {
      setVariants([...variants, variant])
    }
    setIsVariantModalOpen(false)
  }

  const handleEditVariant = (index: number) => {
    setEditingVariantIndex(index)
    setIsVariantModalOpen(true)
  }

  const handleRemoveVariant = () => {
    if (removeVariantIndex !== null) {
      setVariants(variants.filter((_, i) => i !== removeVariantIndex))
      setRemoveVariantIndex(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              {product
                ? 'Atualize as informações do produto'
                : 'Preencha os dados para criar um novo produto'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Basic Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined })
                      }
                    }}
                    disabled={isLoading}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="categoryId">
                    Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, categoryId: value })
                      if (errors.categoryId) {
                        setErrors({ ...errors, categoryId: undefined })
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">{errors.categoryId}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="basePrice">
                    Preço Base <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.basePrice}
                    onChange={(e) => {
                      setFormData({ ...formData, basePrice: e.target.value })
                      if (errors.basePrice) {
                        setErrors({ ...errors, basePrice: undefined })
                      }
                    }}
                    disabled={isLoading}
                    className={errors.basePrice ? 'border-destructive' : ''}
                  />
                  {errors.basePrice && (
                    <p className="text-sm text-destructive">{errors.basePrice}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              {/* Images */}
              <ImageManager
                images={images}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                onSetCover={handleSetCover}
              />

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Variantes do Produto</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingVariantIndex(null)
                      setIsVariantModalOpen(true)
                    }}
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
                      className="mr-2"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Adicionar Variante
                  </Button>
                </div>

                {variants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                    Nenhuma variante adicionada
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Atributos</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Imagens</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variants.map((variant, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  <strong>{key}:</strong> {typeof value === 'string' ? value : String(value)}
                                </span>
                              ))}
                            </TableCell>
                            <TableCell>{formatCurrency(variant.price)}</TableCell>
                            <TableCell>{variant.stock}</TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {variant.images && variant.images.length > 0 
                                  ? `${variant.images.length} ${variant.images.length === 1 ? 'imagem' : 'imagens'}`
                                  : 'Sem imagens'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditVariant(index)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setRemoveVariantIndex(index)}
                                >
                                  Remover
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Variant Form Modal */}
      <VariantFormModal
        open={isVariantModalOpen}
        onOpenChange={setIsVariantModalOpen}
        onSubmit={handleAddVariant}
        variant={editingVariantIndex !== null ? variants[editingVariantIndex] : null}
      />

      {/* Remove Variant Confirmation */}
      <Dialog
        open={removeVariantIndex !== null}
        onOpenChange={(open) => !open && setRemoveVariantIndex(null)}
      >
        <DialogContent className="sm:max-w-[500px] w-full mx-4">
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Deseja realmente remover esta variante?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveVariantIndex(null)}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleRemoveVariant}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

