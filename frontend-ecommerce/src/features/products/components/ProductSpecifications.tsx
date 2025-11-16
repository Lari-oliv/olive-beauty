import { Product } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { parseVariantAttributes } from '@/shared/lib/utils'

interface ProductSpecificationsProps {
  product: Product
}

// Função para gerar especificações mockadas baseadas no produto
function getMockSpecifications(product: Product): Record<string, string> {
  const baseSpecs: Record<string, string> = {
    'Marca': product.brand || 'Olive Beauty',
    'Categoria': product.category?.name || 'Produtos de Beleza',
  }

  // Extrair atributos das variantes
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0]
    try {
      const attrs = parseVariantAttributes(firstVariant.attributes)
      Object.entries(attrs).forEach(([key, value]) => {
        // Capitalizar a chave
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
        baseSpecs[capitalizedKey] = String(value)
      })
    } catch {
      // Ignorar erros de parsing
    }
  }

  // Adicionar especificações mockadas adicionais baseadas na categoria
  const categoryName = product.category?.name?.toLowerCase() || ''
  
  if (categoryName.includes('maquiagem') || categoryName.includes('makeup')) {
    baseSpecs['Tipo'] = 'Maquiagem'
    baseSpecs['Duração'] = 'Até 12 horas'
    baseSpecs['Tipo de pele'] = 'Todos os tipos'
    baseSpecs['Textura'] = 'Cremosa'
  } else if (categoryName.includes('skincare') || categoryName.includes('cuidados')) {
    baseSpecs['Tipo'] = 'Cuidados com a pele'
    baseSpecs['Tipo de pele'] = 'Todos os tipos'
    baseSpecs['FPS'] = 'SPF 30'
    baseSpecs['Textura'] = 'Leve e não oleosa'
  } else if (categoryName.includes('perfume') || categoryName.includes('fragrância')) {
    baseSpecs['Tipo'] = 'Fragrância'
    baseSpecs['Família olfativa'] = 'Floral'
    baseSpecs['Duração'] = 'Até 8 horas'
    baseSpecs['Concentração'] = 'Eau de Parfum'
  } else {
    baseSpecs['Tipo'] = product.category?.name || 'Produto de Beleza'
    baseSpecs['Origem'] = 'Nacional'
    baseSpecs['Certificação'] = 'ANVISA'
  }

  // Adicionar informações padrão
  baseSpecs['Origem'] = baseSpecs['Origem'] || 'Nacional'
  baseSpecs['Certificação'] = baseSpecs['Certificação'] || 'ANVISA'
  baseSpecs['Garantia'] = '90 dias contra defeitos'

  return baseSpecs
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const specifications = getMockSpecifications(product)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Características do produto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {Object.entries(specifications).map(([key, value], index) => (
            <div
              key={key}
              className={`
                flex py-4 border-b border-border last:border-0
                ${index % 2 === 0 ? 'bg-muted/30' : ''}
                hover:bg-muted/50 transition-colors
              `}
            >
              <div className="w-1/3 md:w-1/4 font-semibold text-muted-foreground pr-4">
                {key}
              </div>
              <div className="flex-1 text-foreground font-medium">{value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

