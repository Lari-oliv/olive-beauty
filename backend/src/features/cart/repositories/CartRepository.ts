import { PrismaClient, Cart, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: true;
          };
        };
        productVariant: true;
      };
    };
  };
}>;

export class CartRepository {
  async findByUserId(userId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
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
          orderBy: {
            createdAt: 'desc', // Newest items first
          },
        },
      },
    });
  }

  async create(userId: string): Promise<CartWithItems> {
    return prisma.cart.create({
      data: { userId },
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
          orderBy: {
            createdAt: 'desc', // Newest items first
          },
        },
      },
    });
  }

  async findOrCreate(userId: string): Promise<CartWithItems> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = await this.create(userId);
    }

    return cart;
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }
}

