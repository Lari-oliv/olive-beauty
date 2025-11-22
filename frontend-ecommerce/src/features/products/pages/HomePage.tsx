import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Product, Category } from "@/shared/types";
import { productsApi } from "@/api/endpoints/products";
import { categoriesApi } from "@/api/endpoints/categories";
import { ProductCard } from "@/shared/components/ProductCard";
import { Button } from "@/shared/components/ui/button";
import { ProductCardSkeleton } from "@/shared/components/Skeleton";
import { EmptyState, EmptyProductsIcon } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const products = await productsApi.getAll({ sortBy: "createdAt" });
      // Get latest 3 products as featured
      setFeaturedProducts(products.slice(0, 3));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar produtos";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    setIsLoadingCategory(true);
    try {
      // Busca todas as categorias primeiro
      const categories = await categoriesApi.getAll();

      // Escolhe a primeira categoria disponível (ou pode ser específica como "Maquiagem")
      const category =
        categories.find((c) => c.name === "Maquiagem") || categories[0];

      if (category) {
        setSelectedCategory(category);
        // Busca produtos dessa categoria
        const products = await productsApi.getAll({
          categoryId: category.id,
          sortBy: "createdAt",
        });
        // Pega os 3 primeiros produtos da categoria
        setCategoryProducts(products.slice(0, 3));
      }
    } catch (err) {
      console.error("Erro ao buscar produtos da categoria:", err);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoryProducts();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Banner Principal */}
      <section
        className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg"
        style={{
          backgroundImage: "url('/images/banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent z-10" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
          <div className="text-center text-white space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              Bem-vindo à Olive Beauty
            </h1>
            <p className="text-xl md:text-2xl drop-shadow-md">
            <strong>Onde a natureza encontra o luxo!</strong>
             <br />Eleve a sua rotina de cuidados
            </p>
            <Link
              to="/products"
              search={{
                categoryId: undefined,
                search: undefined,
                brand: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                sortBy: "createdAt",
              }}
            >
              <Button size="lg" variant="secondary" className="mt-4 shadow-lg">
                Ver Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
          <Link
            to="/products"
            search={{
              categoryId: undefined,
              search: undefined,
              brand: undefined,
              minPrice: undefined,
              maxPrice: undefined,
              sortBy: "createdAt",
            }}
          >
            <Button variant="outline">Ver Todos</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum produto encontrado"
            description="Não há produtos em destaque no momento."
            icon={<EmptyProductsIcon />}
            actionLabel="Ver Todos os Produtos"
            onAction={() => (window.location.href = "/products")}
          />
        )}
      </section>

      {/* Banners de Ofertas */}
      <section className="container space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Banner Oferta 1 */}
          <div
            className="relative h-[200px] md:h-[250px] overflow-hidden rounded-lg group cursor-pointer"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-purple-800/60 z-10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Até 30% OFF
              </h3>
              <p className="text-sm md:text-base text-center">
                Em produtos selecionados
              </p>
              <Link
                to="/products"
                search={{
                  categoryId: undefined,
                  search: undefined,
                  brand: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  sortBy: "price_asc",
                }}
                className="mt-4"
              >
                <Button size="sm" variant="secondary">
                  Ver Ofertas
                </Button>
              </Link>
            </div>
          </div>

          {/* Banner Oferta 2 */}
          <div
            className="relative h-[200px] md:h-[250px] overflow-hidden rounded-lg group cursor-pointer"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-red-600/60 z-10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Frete Grátis
              </h3>
              <p className="text-sm md:text-base text-center">
                Em compras acima de R$ 100
              </p>
              <Link
                to="/products"
                search={{
                  categoryId: undefined,
                  search: undefined,
                  brand: undefined,
                  minPrice: 100,
                  maxPrice: undefined,
                  sortBy: "createdAt",
                }}
                className="mt-4"
              >
                <Button size="sm" variant="secondary">
                  Comprar Agora
                </Button>
              </Link>
            </div>
          </div>

          {/* Banner Oferta 3 */}
          <div
            className="relative h-[200px] md:h-[250px] overflow-hidden rounded-lg group cursor-pointer md:col-span-2 lg:col-span-1"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-cyan-600/60 z-10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Novidades</h3>
              <p className="text-sm md:text-base text-center">
                Confira os lançamentos
              </p>
              <Link
                to="/products"
                search={{
                  categoryId: undefined,
                  search: undefined,
                  brand: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  sortBy: "createdAt",
                }}
                className="mt-4"
              >
                <Button size="sm" variant="secondary">
                  Ver Novidades
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos de Categoria Específica */}
      {selectedCategory && (
        <section className="container space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">{selectedCategory.name}</h2>
            <Link
              to="/products"
              search={{
                categoryId: selectedCategory.id,
                search: undefined,
                brand: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                sortBy: "createdAt",
              }}
            >
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>

          {isLoadingCategory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
