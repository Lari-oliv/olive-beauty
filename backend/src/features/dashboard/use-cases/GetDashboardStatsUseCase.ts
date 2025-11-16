import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GetDashboardStatsUseCase {
  async execute() {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.user.count({
        where: { role: 'USER' },
      }),
      prisma.product.count(),
    ]);

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalUsers: totalCustomers,
      totalProducts,
    };
  }
}

