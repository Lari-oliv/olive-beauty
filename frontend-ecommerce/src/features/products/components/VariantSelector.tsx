import { ProductVariant } from '@/shared/types'
import { parseVariantAttributes } from '@/shared/lib/utils'
import { cn } from '@/shared/lib/utils'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelectVariant: (variant: ProductVariant) => void
}

// Mapeamento de cores comuns para valores hex
const colorMap: Record<string, string> = {
  vermelho: '#ef4444',
  red: '#ef4444',
  azul: '#3b82f6',
  blue: '#3b82f6',
  verde: '#22c55e',
  green: '#22c55e',
  amarelo: '#eab308',
  yellow: '#eab308',
  preto: '#000000',
  black: '#000000',
  branco: '#ffffff',
  white: '#ffffff',
  rosa: '#ec4899',
  pink: '#ec4899',
  roxo: '#a855f7',
  purple: '#a855f7',
  laranja: '#f97316',
  orange: '#f97316',
  bege: '#f5deb3',
  beige: '#f5deb3',
  marrom: '#8b4513',
  brown: '#8b4513',
  cinza: '#6b7280',
  gray: '#6b7280',
  dourado: '#d4af37',
  gold: '#d4af37',
  prata: '#c0c0c0',
  silver: '#c0c0c0',
}

function getColorValue(color: string): string {
  const normalized = color.toLowerCase().trim()
  return colorMap[normalized] || '#cccccc'
}

function isColorAttribute(key: string, value: string): boolean {
  const colorKeys = ['cor', 'color', 'colour']
  return colorKeys.includes(key.toLowerCase())
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return null
  }

  // Parsear atributos de todas as variantes
  const variantsWithAttrs = variants.map((variant) => {
    try {
      const attrs = parseVariantAttributes(variant.attributes)
      return { variant, attrs }
    } catch {
      return { variant, attrs: {} }
    }
  })

  // Obter atributos selecionados atualmente
  const selectedAttrs = selectedVariant
    ? parseVariantAttributes(selectedVariant.attributes)
    : {}

  // Obter todas as chaves de atributos únicas
  const allAttributeKeys = new Set<string>()
  variantsWithAttrs.forEach(({ attrs }) => {
    Object.keys(attrs).forEach((key) => allAttributeKeys.add(key))
  })

  // Se não há atributos, mostrar como "Padrão"
  if (allAttributeKeys.size === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Opções:</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id
              const isOutOfStock = variant.stock === 0

              return (
                <button
                  key={variant.id}
                  onClick={() => !isOutOfStock && onSelectVariant(variant)}
                  disabled={isOutOfStock}
                  className={cn(
                    'px-3 py-1.5 rounded border text-sm min-w-[60px] relative transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border bg-background text-foreground hover:border-primary/50',
                    isOutOfStock && 'opacity-40 cursor-not-allowed'
                  )}
                  title={
                    isOutOfStock
                      ? 'Esgotado'
                      : `Padrão${variant.stock > 0 ? ` - ${variant.stock} em estoque` : ''}`
                  }
                >
                  <span>Padrão</span>
                  {isOutOfStock && (
                    <span className="absolute -top-1 -right-1 text-xs text-destructive">✕</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Função para filtrar variantes baseado nos atributos selecionados
  const getAvailableVariants = (excludeAttributeKey?: string) => {
    return variantsWithAttrs.filter(({ attrs }) => {
      // Se não há atributo selecionado, retornar todas
      if (Object.keys(selectedAttrs).length === 0) {
        return true
      }

      // Verificar se a variante é compatível com os atributos selecionados
      return Object.entries(selectedAttrs).every(([key, value]) => {
        // Ignorar o atributo que estamos filtrando
        if (key === excludeAttributeKey) {
          return true
        }
        return attrs[key] === value
      })
    })
  }

  // Agrupar valores únicos por atributo, considerando apenas variantes disponíveis
  const groupedVariants: Record<
    string,
    Array<{ value: string; variant: ProductVariant; isAvailable: boolean }>
  > = {}

  Array.from(allAttributeKeys).forEach((attributeKey) => {
    const availableVariants = getAvailableVariants(attributeKey)
    const valueMap = new Map<string, { variant: ProductVariant; isAvailable: boolean }>()

    availableVariants.forEach(({ variant, attrs }) => {
      const value = String(attrs[attributeKey] || '')
      if (value) {
        // Preferir variante com estoque, mas manter todas as opções
        if (!valueMap.has(value)) {
          valueMap.set(value, { variant, isAvailable: variant.stock > 0 })
        } else {
          // Se já existe, preferir a que tem estoque
          const existing = valueMap.get(value)!
          if (variant.stock > 0 && !existing.isAvailable) {
            valueMap.set(value, { variant, isAvailable: true })
          }
        }
      }
    })

    groupedVariants[attributeKey] = Array.from(valueMap.entries()).map(([value, data]) => ({
      value,
      ...data,
    }))
  })

  // Função para encontrar variante baseada na seleção de atributo
  const findVariantByAttribute = (attributeKey: string, attributeValue: string): ProductVariant | null => {
    const newAttrs = { ...selectedAttrs, [attributeKey]: attributeValue }
    
    // Primeiro, procurar variante que corresponde exatamente aos atributos
    const exactMatch = variantsWithAttrs.find(({ attrs }) => {
      // Verificar se todos os atributos da variante correspondem aos novos atributos
      const allKeys = new Set([...Object.keys(attrs), ...Object.keys(newAttrs)])
      return Array.from(allKeys).every((key) => {
        const variantValue = attrs[key]
        const newValue = newAttrs[key]
        // Se a chave não existe em um dos objetos, considerar como não correspondente
        if (variantValue === undefined || newValue === undefined) {
          return variantValue === newValue
        }
        return variantValue === newValue
      })
    })

    if (exactMatch) {
      return exactMatch.variant
    }

    // Se não encontrou exato, procurar variante que tem esse valor de atributo
    // e que seja compatível com os outros atributos selecionados (mas não necessariamente todos)
    const compatibleVariants = variantsWithAttrs.filter(({ attrs, variant }) => {
      if (attrs[attributeKey] !== attributeValue) {
        return false
      }
      // Verificar compatibilidade com outros atributos selecionados
      // Se não há outros atributos selecionados, aceitar qualquer variante com esse valor
      if (Object.keys(selectedAttrs).length === 0) {
        return true
      }
      // Verificar se os outros atributos selecionados são compatíveis
      return Object.entries(selectedAttrs).every(([key, value]) => {
        if (key === attributeKey) return true
        // Se a variante não tem esse atributo, considerar como compatível
        if (attrs[key] === undefined) return true
        return attrs[key] === value
      })
    })

    // Preferir variante com estoque
    const withStock = compatibleVariants.find(({ variant }) => variant.stock > 0)
    if (withStock) {
      return withStock.variant
    }

    // Se não há com estoque, retornar a primeira compatível
    return compatibleVariants[0]?.variant || null
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedVariants).map(([attributeKey, items]) => {
        const isColor = isColorAttribute(attributeKey, '')
        const selectedValue = selectedAttrs[attributeKey]

        return (
          <div key={attributeKey} className="space-y-2">
            <h3 className="text-sm font-medium text-foreground capitalize">
              {attributeKey}:
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map(({ value, variant, isAvailable }) => {
                const isSelected = selectedValue === value
                const isOutOfStock = variant.stock === 0
                const colorValue = isColor ? getColorValue(value) : null

                return (
                  <button
                    key={`${attributeKey}-${value}-${variant.id}`}
                    onClick={() => {
                      if (!isOutOfStock) {
                        const newVariant = findVariantByAttribute(attributeKey, value)
                        if (newVariant) {
                          onSelectVariant(newVariant)
                        }
                      }
                    }}
                    disabled={isOutOfStock}
                    className={cn(
                      'relative transition-colors',
                      isColor
                        ? 'w-10 h-10 rounded-full border flex items-center justify-center'
                        : 'px-3 py-1.5 rounded border text-sm min-w-[60px]',
                      isSelected
                        ? isColor
                          ? 'border-primary ring-1 ring-primary/30'
                          : 'border-primary bg-primary/10 text-primary font-medium'
                        : isColor
                          ? 'border-border hover:border-primary/50'
                          : 'border-border bg-background text-foreground hover:border-primary/50',
                      isOutOfStock && 'opacity-40 cursor-not-allowed'
                    )}
                    style={
                      isColor && colorValue
                        ? {
                            backgroundColor: colorValue,
                            borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                          }
                        : undefined
                    }
                    title={
                      isOutOfStock
                        ? 'Esgotado'
                        : `${value}${variant.stock > 0 ? ` - ${variant.stock} em estoque` : ''}`
                    }
                    aria-label={`Selecionar ${attributeKey}: ${value}${isOutOfStock ? ' (esgotado)' : ''}`}
                  >
                    {isColor ? (
                      <>
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <span>{value}</span>
                        {isOutOfStock && (
                          <span className="absolute -top-1 -right-1 text-xs text-destructive">
                            ✕
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

