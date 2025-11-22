import { PrismaClient, Order, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderRepository {
  async create(data: {
    userId: string;
    total: number;
    shippingAddress: string;
    shippingName: string;
    shippingPhone?: string;
  }): Promise<Order> {
    return prisma.order.create({
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        user: true,
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isCover: true }, take: 1 },
              },
            },
            productVariant: true,
          },
        },
        user: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isCover: true }, take: 1 },
              },
            },
            productVariant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(): Promise<Order[]> {
    return prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isCover: true }, take: 1 },
              },
            },
            productVariant: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        user: true,
      },
    });
  }
}

