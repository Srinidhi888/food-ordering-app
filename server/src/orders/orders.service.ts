import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(user: User, createOrderDto: CreateOrderDto) {
    const itemIds = createOrderDto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
      include: { restaurant: true },
    });

    if (itemIds.length !== menuItems.length) {
      throw new NotFoundException('Some menu items not found');
    }

    // Check if all items belong to the same restaurant
    const restaurantIds = new Set(menuItems.map((i) => i.restaurantId));
    if (restaurantIds.size > 1) {
      throw new ForbiddenException(
        'All items in an order must be from the same restaurant',
      );
    }

    if (user.role !== Role.ADMIN) {
      const invalidItems = menuItems.filter(
        (i) => i.restaurant.country !== user.country,
      );
      if (invalidItems.length > 0) {
        throw new ForbiddenException(
          'Cannot order items from a different country',
        );
      }
    }

    let totalAmount = 0;
    const orderItemsData: { menuItemId: number; quantity: number }[] = [];

    for (const itemDto of createOrderDto.items) {
      const menuItem = menuItems.find((m) => m.id === itemDto.menuItemId);
      if (!menuItem) throw new NotFoundException('Item not found'); // Should be covered by previous check but good for TS
      totalAmount += menuItem.price * itemDto.quantity;
      orderItemsData.push({
        menuItemId: itemDto.menuItemId,
        quantity: itemDto.quantity,
      });
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        country: user.country,
        status: OrderStatus.CREATED,
        totalAmount,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  findAll(user: User) {
    if (user.role === Role.ADMIN) {
      return this.prisma.order.findMany({
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }
    // Managers/Members view orders in their country? Or just their own?
    // "Managers & Members act on the functions... limited to their country only"
    // Assuming they can view all orders in their country (Manager) or own orders (Member)?
    // Problem 2.1 view restaurants. 2.2 create order.
    // It doesn't explicitly restrict view capabilities for orders.
    // I will return orders for the country for Simplicity.
    return this.prisma.order.findMany({
      where: { country: user.country },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async checkout(id: number, user: User) {
    // 2.3 checkout cart and pay using existing payment method
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.CREATED) {
      throw new ForbiddenException('Order already placed or cancelled');
    }

    // Check payment method
    if (!user.payment) {
      throw new ForbiddenException('User has no payment method set');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.PLACED },
    });
  }

  async cancel(id: number, user: User) {
    // 2.4 cancel order
    // Member: NO. Manager: YES. Admin: YES.
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot cancel orders');
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    if (user.role === Role.MANAGER && order.country !== user.country) {
      throw new ForbiddenException('Cannot cancel order from another country');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });
  }
}
