import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GetDashboardStatsUseCase } from '../use-cases/GetDashboardStatsUseCase';
import { GetTopProductsUseCase } from '../use-cases/GetTopProductsUseCase';
import { GetRevenueOverTimeUseCase } from '../use-cases/GetRevenueOverTimeUseCase';
import { GetOrdersOverTimeUseCase } from '../use-cases/GetOrdersOverTimeUseCase';
import { GetOrdersByStatusUseCase } from '../use-cases/GetOrdersByStatusUseCase';
import { GetSalesByCategoryUseCase } from '../use-cases/GetSalesByCategoryUseCase';

const prisma = new PrismaClient();

const getDashboardStatsUseCase = new GetDashboardStatsUseCase();
const getTopProductsUseCase = new GetTopProductsUseCase();
const getRevenueOverTimeUseCase = new GetRevenueOverTimeUseCase();
const getOrdersOverTimeUseCase = new GetOrdersOverTimeUseCase();
const getOrdersByStatusUseCase = new GetOrdersByStatusUseCase();
const getSalesByCategoryUseCase = new GetSalesByCategoryUseCase();

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await getDashboardStatsUseCase.execute();
      return res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar estatísticas',
      });
    }
  }

  async getTopProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topProducts = await getTopProductsUseCase.execute(limit);
      return res.json({
        status: 'success',
        data: topProducts,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar produtos mais vendidos',
      });
    }
  }

  async getRevenueOverTime(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await getRevenueOverTimeUseCase.execute(days);
      return res.json({
        status: 'success',
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar receita ao longo do tempo',
      });
    }
  }

  async getOrdersOverTime(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await getOrdersOverTimeUseCase.execute(days);
      // Transformar array: orders -> count para compatibilidade com frontend
      const data = result.data.map(item => ({
        date: item.date,
        count: item.orders,
      }));
      return res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar pedidos ao longo do tempo',
      });
    }
  }

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await getOrdersByStatusUseCase.execute(days);
      // Transformar para o formato esperado pelo frontend: array de { status, count }
      const data = Object.entries(result.totals).map(([status, count]) => ({
        status: status as any,
        count: count,
      }));
      return res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar pedidos por status',
      });
    }
  }

  async getSalesByCategory(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await getSalesByCategoryUseCase.execute(days);
      
      // Buscar categorias do banco para ter os objetos completos
      const categories = await prisma.category.findMany({
        where: {
          name: {
            in: Object.keys(result.totals),
          },
        },
      });
      
      // Transformar para o formato esperado pelo frontend: array de { category, revenue, count }
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const data = await Promise.all(
        Object.entries(result.totals).map(async ([categoryName, revenue]) => {
          const category = categories.find((c) => c.name === categoryName);
          
          // Contar pedidos por categoria no período
          const count = await prisma.order.count({
            where: {
              createdAt: {
                gte: startDate,
              },
              items: {
                some: {
                  product: {
                    category: {
                      name: categoryName,
                    },
                  },
                },
              },
            },
          });
          
          return {
            category: category || { 
              id: '', 
              name: categoryName, 
              createdAt: new Date().toISOString(), 
              updatedAt: new Date().toISOString() 
            },
            revenue: revenue as number,
            count,
          };
        })
      );
      
      return res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar vendas por categoria',
      });
    }
  }
}

