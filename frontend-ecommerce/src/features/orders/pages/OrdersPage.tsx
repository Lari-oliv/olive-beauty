import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ordersApi } from '@/api/endpoints/orders'
import { Order, OrderStatus } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { formatCurrency } from '@/shared/lib/utils'
import { OrderCardSkeleton } from '@/shared/components/Skeleton'
import { EmptyState, EmptyOrdersIcon } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'

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

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await ordersApi.getMyOrders()
      // Sort by date (most recent first)
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setOrders(sorted)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar pedidos. Tente novamente.'
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>
        <ErrorState message={error} onRetry={loadOrders} />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>
        <EmptyState
          title="Você ainda não fez nenhum pedido"
          description="Quando você fizer um pedido, ele aparecerá aqui."
          icon={<EmptyOrdersIcon />}
          actionLabel="Ver Produtos"
          onAction={() => window.location.href = '/products'}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Realizado em {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                  <p className="text-lg font-semibold">
                    Total: {formatCurrency(order.total)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Navigating to order:', order.id)
                    navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
                  }}
                >
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

