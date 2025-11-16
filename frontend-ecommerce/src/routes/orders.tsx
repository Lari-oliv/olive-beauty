import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { useRequireAuth } from '@/shared/hooks/useRequireAuth'
import { OrdersPage } from '@/features/orders/pages/OrdersPage'

export const Route = createFileRoute('/orders')({
  component: OrdersPageWrapper,
})

function OrdersPageWrapper() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  const matchRoute = useMatchRoute()
  const isOrderDetail = matchRoute({ to: '/orders/$orderId' })

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useRequireAuth
  }

  return (
    <>
      {!isOrderDetail && <OrdersPage />}
      <Outlet />
    </>
  )
}

