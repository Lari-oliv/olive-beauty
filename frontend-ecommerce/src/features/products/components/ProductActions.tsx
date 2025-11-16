import { Button } from "@/shared/components/ui/button";

interface ProductActionsProps {
  hasStock: boolean;
  isAddingToCart: boolean;
  isFavorite: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleFavorite: () => void;
  cartLoading?: boolean;
}

export function ProductActions({
  hasStock,
  isAddingToCart,
  isFavorite,
  onAddToCart,
  onBuyNow,
  onToggleFavorite,
  cartLoading = false,
}: ProductActionsProps) {
  const handleAddToCart = () => {
    onAddToCart();
  };

  const handleBuyNow = () => {
    onBuyNow();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold text-lg py-6"
          onClick={handleBuyNow}
          disabled={!hasStock || isAddingToCart || cartLoading}
          size="lg"
        >
          Comprar agora
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-2 font-semibold text-lg py-6"
          onClick={handleAddToCart}
          disabled={!hasStock || isAddingToCart || cartLoading}
          size="lg"
        >
          Adicionar ao carrinho
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-auto w-14 border-2"
          onClick={onToggleFavorite}
          aria-label={
            isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isFavorite ? "text-red-500" : ""}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
          </svg>
        </Button>
      </div>

      {/* Informações de segurança */}
      <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-600"
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
          <span>Compra 100% segura</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-600"
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
          <span>Devolução grátis em até 7 dias</span>
        </div>
      </div>
    </div>
  );
}
