import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { ordersApi } from '@/api/endpoints/orders'
import { Order, OrderStatus } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { formatCurrency } from '@/shared/lib/utils'

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  SENT: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Em Processamento',
  SENT: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

export function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('OrderDetailPage mounted - orderId:', orderId)
    if (orderId) {
      loadOrder()
    } else {
      console.error('OrderDetailPage - orderId is missing!')
      setError('ID do pedido não encontrado')
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const loadOrder = async () => {
    if (!orderId) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await ordersApi.getById(orderId)
      setOrder(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar pedido. Tente novamente.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const parseAttributes = (attributes: string) => {
    try {
      return JSON.parse(attributes)
    } catch {
      return {}
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={loadOrder}>Tentar Novamente</Button>
                <Button asChild variant="outline">
                  <Link to="/orders">Voltar para Pedidos</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Pedido não encontrado.</p>
              <Button asChild>
                <Link to="/orders">Voltar para Pedidos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/orders">← Voltar para Pedidos</Link>
        </Button>
        <h1 className="text-3xl font-bold">Detalhes do Pedido</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Pedido #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Realizado em {formatDate(order.createdAt)}
                  </p>
                  {order.updatedAt !== order.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Atualizado em {formatDate(order.updatedAt)}
                    </p>
                  )}
                </div>
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                  <div className="text-sm space-y-1 border rounded-md p-3 bg-muted/50">
                    <p>
                      <strong>Nome:</strong> {order.shippingName}
                    </p>
                    <p>
                      <strong>Endereço:</strong> {order.shippingAddress}
                    </p>
                    {order.shippingPhone && (
                      <p>
                        <strong>Telefone:</strong> {order.shippingPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const variantAttributes = item.productVariant
                        ? parseAttributes(item.productVariant.attributes)
                        : {}
                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                            {item.product?.images?.find((img) => img.isCover)?.url ? (
                              <img
                                src={item.product.images.find((img) => img.isCover)!.url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                Sem imagem
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.product?.name}</h4>
                                {item.productVariant && Object.keys(variantAttributes).length > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    {Object.entries(variantAttributes)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  Quantidade: {item.quantity}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Preço unitário: {formatCurrency(item.price)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                                {item.product && (
                                  <Button asChild variant="link" size="sm" className="mt-1">
                                    <Link to={`/products/${item.product.id}`}>
                                      Ver Produto
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Itens ({order.items.length}):</span>
                  <span>
                    {formatCurrency(
                      order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

