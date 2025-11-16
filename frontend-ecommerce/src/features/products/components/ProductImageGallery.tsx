import { useState, useRef } from 'react'
import { ProductImage } from '@/shared/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
  hasFreeShipping?: boolean
}

export function ProductImageGallery({
  images,
  productName,
  hasFreeShipping = false,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Sem imagem</span>
        </div>
      </div>
    )
  }

  const currentImage = images[selectedIndex]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x, y })
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Imagem Principal */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        {hasFreeShipping && (
          <Badge
            className="absolute top-4 right-4 z-20 bg-green-600 hover:bg-green-700 text-white border-0 font-semibold"
            variant="default"
          >
            Frete Grátis
          </Badge>
        )}
        
        {/* Botões de navegação (setas) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
              aria-label="Imagem anterior"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
              aria-label="Próxima imagem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </>
        )}
        
        <div
          ref={imageRef}
          className="relative w-full h-full cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={currentImage.url}
            alt={`${productName} - Imagem ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: isZoomed ? `scale(2)` : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
            loading="eager"
          />
        </div>

        {/* Indicador de quantidade de imagens */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-all relative ${
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary/20 shadow-md'
                  : 'border-transparent hover:border-muted-foreground/50'
              }`}
              aria-label={`Ver imagem ${index + 1} de ${images.length}`}
            >
              <img
                src={image.url}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {selectedIndex === index && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

