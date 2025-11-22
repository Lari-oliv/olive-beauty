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
import { ImageManager } from './ImageManager'

export interface ProductVariant {
  attributes: Record<string, string>
  price: number
  stock: number
  images?: Array<{ url: string; isCover: boolean }> // Images specific to this variant
}

interface VariantFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (variant: ProductVariant) => void
  variant?: ProductVariant | null
  isLoading?: boolean
}

export function VariantFormModal({
  open,
  onOpenChange,
  onSubmit,
  variant,
  isLoading = false,
}: VariantFormModalProps) {
  const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ])
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [images, setImages] = useState<Array<{ url: string; isCover: boolean }>>([])
  const [errors, setErrors] = useState<{
    attributes?: string
    price?: string
    stock?: string
  }>({})

  useEffect(() => {
    if (variant) {
      // Convert attributes object to array
      const attrsArray = Object.entries(variant.attributes).map(([key, value]) => ({
        key,
        value,
      }))
      setAttributes(attrsArray.length > 0 ? attrsArray : [{ key: '', value: '' }])
      setPrice(variant.price.toString())
      setStock(variant.stock.toString())
      setImages(variant.images || []) // Initialize images from variant
    } else {
      setAttributes([{ key: '', value: '' }])
      setPrice('')
      setStock('')
      setImages([]) // Reset images for new variant
    }
    setErrors({})
  }, [variant, open])

  const validate = (): boolean => {
    const newErrors: { attributes?: string; price?: string; stock?: string } = {}

    // Validate attributes
    const validAttributes = attributes.filter((attr) => attr.key.trim() && attr.value.trim())
    if (validAttributes.length === 0) {
      newErrors.attributes = 'Adicione pelo menos um atributo (ex: cor, tamanho)'
    }

    // Validate price
    const priceNum = parseFloat(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Preço deve ser um número positivo'
    }

    // Validate stock
    const stockNum = parseInt(stock)
    if (stock === '' || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Estoque deve ser um número inteiro não negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const validAttributes = attributes
      .filter((attr) => attr.key.trim() && attr.value.trim())
      .reduce((acc, attr) => {
        acc[attr.key.trim()] = attr.value.trim()
        return acc
      }, {} as Record<string, string>)

    onSubmit({
      attributes: validAttributes,
      price: parseFloat(price),
      stock: parseInt(stock),
      images: images.length > 0 ? images : undefined, // Include images if any
    })

    onOpenChange(false)
  }

  const addAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...attributes]
    updated[index] = { ...updated[index], [field]: value }
    setAttributes(updated)
    if (errors.attributes) {
      setErrors({ ...errors, attributes: undefined })
    }
  }

  // Image management handlers
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full mx-4">
        <DialogHeader>
          <DialogTitle>
            {variant ? 'Editar Variante' : 'Nova Variante'}
          </DialogTitle>
          <DialogDescription>
            {variant
              ? 'Atualize as informações da variante'
              : 'Adicione uma nova variante ao produto'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Attributes */}
            <div className="grid gap-2">
              <Label>
                Atributos <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                {attributes.map((attr, index) => {
                  const isColorAttribute = attr.key.toLowerCase().trim() === 'cor' || 
                                           attr.key.toLowerCase().trim() === 'color' ||
                                           attr.key.toLowerCase().trim() === 'colour'
                  
                  // Função para validar se é um código de cor válido (hex ou rgb)
                  const isValidColorCode = (value: string): boolean => {
                    const trimmed = value.trim()
                    // Hex: #RRGGBB ou #RGB
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(trimmed)) {
                      return true
                    }
                    // RGB: rgb(r, g, b) ou rgba(r, g, b, a)
                    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(trimmed)) {
                      return true
                    }
                    return false
                  }

                  // Converter RGB para hex se necessário
                  const convertRgbToHex = (value: string): string => {
                    const trimmed = value.trim()
                    // Se já é hex, retornar
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(trimmed)) {
                      return trimmed
                    }
                    // Converter RGB para hex
                    const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
                    if (rgbMatch) {
                      const r = parseInt(rgbMatch[1])
                      const g = parseInt(rgbMatch[2])
                      const b = parseInt(rgbMatch[3])
                      return `#${[r, g, b].map(x => {
                        const hex = x.toString(16)
                        return hex.length === 1 ? '0' + hex : hex
                      }).join('')}`
                    }
                    return trimmed
                  }

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <Input
                          placeholder="Ex: Cor"
                          value={attr.key}
                          onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        {isColorAttribute ? (
                          <div className="flex gap-2 flex-1">
                            <div className="relative">
                              <Input
                                type="color"
                                value={isValidColorCode(attr.value) ? convertRgbToHex(attr.value) : '#cccccc'}
                                onChange={(e) => {
                                  updateAttribute(index, 'value', e.target.value.toUpperCase())
                                }}
                                disabled={isLoading}
                                className="h-10 w-20 cursor-pointer p-1"
                                title="Selecione a cor"
                              />
                            </div>
                            <Input
                              placeholder="Ex: #FF0000 ou rgb(255,0,0)"
                              value={attr.value}
                              onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                              disabled={isLoading}
                              className="flex-1"
                            />
                          </div>
                        ) : (
                          <Input
                            placeholder="Ex: Vermelho"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                          />
                        )}
                        {attributes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeAttribute(index)}
                            disabled={isLoading}
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
                              <path d="M18 6 6 18" />
                              <path d="M6 6l12 12" />
                            </svg>
                          </Button>
                        )}
                      </div>
                      {isColorAttribute && (
                        <p className="text-xs text-muted-foreground ml-0">
                          💡 Use o seletor de cor acima ou digite o código RGB/hex (ex: #FF0000, rgb(255,0,0))
                        </p>
                      )}
                    </div>
                  )
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                  disabled={isLoading}
                >
                  Adicionar Atributo
                </Button>
              </div>
              {errors.attributes && (
                <p className="text-sm text-destructive">{errors.attributes}</p>
              )}
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="variant-price">
                Preço <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variant-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  if (errors.price) {
                    setErrors({ ...errors, price: undefined })
                  }
                }}
                disabled={isLoading}
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div className="grid gap-2">
              <Label htmlFor="variant-stock">
                Estoque <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variant-stock"
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value)
                  if (errors.stock) {
                    setErrors({ ...errors, stock: undefined })
                  }
                }}
                disabled={isLoading}
                className={errors.stock ? 'border-destructive' : ''}
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock}</p>
              )}
            </div>

            {/* Images Section */}
            <div className="border-t pt-4">
              <ImageManager
                images={images}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                onSetCover={handleSetCover}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adicione imagens específicas para esta variante (opcional)
              </p>
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
  )
}

