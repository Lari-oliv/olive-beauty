import { useState, useEffect } from "react";
import { dashboardApi } from "@/api/endpoints";
import {
  DashboardStats,
  TimeSeriesData,
  OrdersByStatus,
  SalesByCategory,
  TopProduct,
} from "@/shared/types";
import { StatCard } from "../components/StatCard";
import { PeriodFilter } from "../components/PeriodFilter";
import { RevenueChart } from "../components/RevenueChart";
import { OrdersChart } from "../components/OrdersChart";
import { OrdersByStatusChart } from "../components/OrdersByStatusChart";
import { SalesByCategoryChart } from "../components/SalesByCategoryChart";
import { TopProductsTable } from "../components/TopProductsTable";
import { formatCurrency } from "@/shared/lib/utils";
import { StatCardSkeleton } from "@/shared/components/Skeleton";
import { ErrorState } from "@/shared/components/ErrorState";

export function DashboardPage() {
  const [period, setPeriod] = useState(15);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<TimeSeriesData[]>([]);
  const [ordersData, setOrdersData] = useState<TimeSeriesData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stats (no period dependency)
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar estatísticas"
        );
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // Load charts (with period dependency)
  useEffect(() => {
    const loadCharts = async () => {
      try {
        setLoadingCharts(true);
        setError(null);
        const [revenue, orders, status, category, top] = await Promise.all([
          dashboardApi.getRevenueOverTime(period),
          dashboardApi.getOrdersOverTime(period),
          dashboardApi.getOrdersByStatus(period),
          dashboardApi.getSalesByCategory(period),
          dashboardApi.getTopProducts(10),
        ]);
        setRevenueData(Array.isArray(revenue) ? revenue : []);
        setOrdersData(Array.isArray(orders) ? orders : []);
        setOrdersByStatus(Array.isArray(status) ? status : []);
        setSalesByCategory(Array.isArray(category) ? category : []);
        setTopProducts(Array.isArray(top) ? top : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoadingCharts(false);
      }
    };

    loadCharts();
  }, [period]);

  const handleRetry = async () => {
    setError(null);
    setLoadingStats(true);
    setLoadingCharts(true);

    try {
      // Reload all data instead of reloading the entire page
      const [statsData, revenue, orders, status, category, top] =
        await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRevenueOverTime(period),
          dashboardApi.getOrdersOverTime(period),
          dashboardApi.getOrdersByStatus(period),
          dashboardApi.getSalesByCategory(period),
          dashboardApi.getTopProducts(10),
        ]);

      setStats(statsData);
      setRevenueData(Array.isArray(revenue) ? revenue : []);
      setOrdersData(Array.isArray(orders) ? orders : []);
      setOrdersByStatus(Array.isArray(status) ? status : []);
      setSalesByCategory(Array.isArray(category) ? category : []);
      setTopProducts(Array.isArray(top) ? top : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoadingStats(false);
      setLoadingCharts(false);
    }
  };

  if (error && !stats) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="dashboard-container">
      <div className="space-y-6">
        {/* Header with Period Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral das métricas e estatísticas do sistema
            </p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loadingStats ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Receita Total"
                value={formatCurrency(stats?.totalRevenue || 0)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                description="Total acumulado"
              />
              <StatCard
                title="Total de Pedidos"
                value={stats?.totalOrders || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  </svg>
                }
                description="Todos os pedidos"
              />
              <StatCard
                title="Total de Produtos"
                value={stats?.totalProducts || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                }
                description="Produtos cadastrados"
              />
              <StatCard
                title="Total de Usuários"
                value={stats?.totalUsers || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                description="Usuários cadastrados"
              />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <RevenueChart data={revenueData} isLoading={loadingCharts} />
          <OrdersChart data={ordersData} isLoading={loadingCharts} />
          <OrdersByStatusChart
            data={ordersByStatus}
            isLoading={loadingCharts}
          />
          <SalesByCategoryChart
            data={salesByCategory}
            isLoading={loadingCharts}
          />
        </div>

        {/* Top Products Table */}
        <TopProductsTable data={topProducts} isLoading={loadingCharts} />
      </div>
    </div>
  );
}
