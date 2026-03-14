import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateSharedCartDto } from './dto/create-shared-cart.dto';
import { UpdateSharedCartDto } from './dto/update-shared-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class SharingService {
  constructor(private prisma: PrismaService) { }

  // ===== SHARED CART CRUD =====
  async createSharedCart(user: User, createSharedCartDto: CreateSharedCartDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createSharedCartDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.sharedCart.create({
      data: {
        name: createSharedCartDto.name,
        ownerId: user.id,
        restaurantId: createSharedCartDto.restaurantId,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: new Date(),
          },
        },
      },
      include: {
        owner: true,
        restaurant: true,
        members: { include: { user: true } },
        items: { include: { menuItem: true, addedByUser: true } },
      },
    });
  }

  async getSharedCart(cartId: number, userId: number) {
    const cart = await this.prisma.sharedCart.findUnique({
      where: { id: cartId },
      include: {
        owner: true,
        restaurant: true,
        members: { include: { user: true } },
        items: { include: { menuItem: true, addedByUser: true } },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Security: membership check is role-agnostic — admins and managers
    // get NO special access to shared carts they were not invited to.
    const isMember = cart.members.some(
      (m) => m.userId === userId && m.status !== 'REMOVED',
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this cart');
    }

    return cart;
  }

  async getUserSharedCarts(userId: number) {
    // Security: only return carts where the user is an active/invited member.
    // This is strictly membership-based — no admin override exists.
    // REMOVED members are excluded so they cannot re-access carts after being kicked.
    return this.prisma.sharedCart.findMany({
      where: {
        members: {
          some: {
            userId,
            status: { in: ['ACTIVE', 'INVITED'] },
          },
        },
      },
      include: {
        owner: true,
        restaurant: true,
        members: { include: { user: true } },
        items: { include: { menuItem: true, addedByUser: true } },
      },
    });
  }

  async updateSharedCart(cartId: number, userId: number, updateDto: UpdateSharedCartDto) {
    const cart = await this.getSharedCart(cartId, userId);

    // Only owner can update
    if (cart.ownerId !== userId) {
      throw new ForbiddenException('Only cart owner can update cart details');
    }

    return this.prisma.sharedCart.update({
      where: { id: cartId },
      data: updateDto,
      include: {
        owner: true,
        restaurant: true,
        members: { include: { user: true } },
        items: { include: { menuItem: true, addedByUser: true } },
      },
    });
  }

  async archiveSharedCart(cartId: number, userId: number) {
    const cart = await this.getSharedCart(cartId, userId);

    // Only owner can archive
    if (cart.ownerId !== userId) {
      throw new ForbiddenException('Only cart owner can archive cart');
    }

    return this.prisma.sharedCart.update({
      where: { id: cartId },
      data: { status: 'ARCHIVED' },
      include: {
        owner: true,
        restaurant: true,
        members: { include: { user: true } },
        items: { include: { menuItem: true, addedByUser: true } },
      },
    });
  }

  // ===== CART ITEMS =====
  async addCartItem(cartId: number, userId: number, addItemDto: AddCartItemDto) {
    const cart = await this.getSharedCart(cartId, userId);

    // Verify menu item exists and belongs to this restaurant
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: addItemDto.menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (menuItem.restaurantId !== cart.restaurantId) {
      throw new ForbiddenException('Item does not belong to this cart\'s restaurant');
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.sharedCartItem.findUnique({
      where: {
        sharedCartId_menuItemId: {
          sharedCartId: cartId,
          menuItemId: addItemDto.menuItemId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return this.prisma.sharedCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: addItemDto.quantity } },
        include: { menuItem: true, addedByUser: true, sharedCart: true },
      });
    }

    // Create new item
    return this.prisma.sharedCartItem.create({
      data: {
        sharedCartId: cartId,
        menuItemId: addItemDto.menuItemId,
        quantity: addItemDto.quantity,
        addedBy: userId,
        notes: addItemDto.notes,
      },
      include: { menuItem: true, addedByUser: true, sharedCart: true },
    });
  }

  async updateCartItemQuantity(cartId: number, userId: number, itemId: number, quantity: number) {
    const item = await this.prisma.sharedCartItem.findUnique({
      where: { id: itemId },
      include: { sharedCart: true },
    });

    if (!item || item.sharedCartId !== cartId) {
      throw new NotFoundException('Item not found in this cart');
    }

    // Any active cart member can update quantities (collaborative shared cart)
    await this.getSharedCart(cartId, userId);

    if (quantity <= 0) {
      return this.removeCartItem(cartId, userId, itemId);
    }

    return this.prisma.sharedCartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { menuItem: true, addedByUser: true, sharedCart: true },
    });
  }

  async removeCartItem(cartId: number, userId: number, itemId: number) {
    const item = await this.prisma.sharedCartItem.findUnique({
      where: { id: itemId },
      include: { sharedCart: true },
    });

    if (!item || item.sharedCartId !== cartId) {
      throw new NotFoundException('Item not found in this cart');
    }

    // Verify user is member of cart
    await this.getSharedCart(cartId, userId);

    // Only the user who added the item or owner can remove it
    const cartOwner = await this.getCartOwner(cartId);
    if (item.addedBy !== userId && cartOwner !== userId) {
      throw new ForbiddenException('Only the person who added this item or the owner can delete it');
    }

    return this.prisma.sharedCartItem.delete({
      where: { id: itemId },
      include: { menuItem: true, addedByUser: true, sharedCart: true },
    });
  }

  async clearCartItems(cartId: number, userId: number) {
    const cart = await this.getSharedCart(cartId, userId);

    // Only owner can clear all items
    if (cart.ownerId !== userId) {
      throw new ForbiddenException('Only cart owner can clear all items');
    }

    await this.prisma.sharedCartItem.deleteMany({
      where: { sharedCartId: cartId },
    });

    return this.getSharedCart(cartId, userId);
  }

  // ===== MEMBER MANAGEMENT =====
  async inviteMember(cartId: number, userId: number, inviteDto: InviteMemberDto) {
    const cart = await this.getSharedCart(cartId, userId);

    // Only owner can invite
    if (cart.ownerId !== userId) {
      throw new ForbiddenException('Only cart owner can invite members');
    }

    // Verify invited user exists
    const invitedUser = await this.prisma.user.findUnique({
      where: { id: inviteDto.userId },
    });

    if (!invitedUser) {
      throw new NotFoundException('User to invite not found');
    }

    // Check if already a member
    const existingMember = await this.prisma.sharedCartMember.findUnique({
      where: {
        sharedCartId_userId: {
          sharedCartId: cartId,
          userId: inviteDto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this cart');
    }

    return this.prisma.sharedCartMember.create({
      data: {
        sharedCartId: cartId,
        userId: inviteDto.userId,
        role: 'MEMBER',
        accessLevel: inviteDto.accessLevel || 'CAN_ADD_ITEMS',
        status: 'INVITED',
      },
      include: { user: true, sharedCart: true },
    });
  }

  async acceptInvitation(cartId: number, userId: number) {
    const member = await this.prisma.sharedCartMember.findUnique({
      where: {
        sharedCartId_userId: {
          sharedCartId: cartId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('No invitation found');
    }

    if (member.status === 'ACTIVE') {
      throw new ForbiddenException('You are already a member of this cart');
    }

    return this.prisma.sharedCartMember.update({
      where: { id: member.id },
      data: {
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
      include: { user: true, sharedCart: true },
    });
  }

  async removeMember(cartId: number, ownerUserId: number, memberUserId: number) {
    const cart = await this.getSharedCart(cartId, ownerUserId);

    // Only owner can remove members
    if (cart.ownerId !== ownerUserId) {
      throw new ForbiddenException('Only cart owner can remove members');
    }

    // Cannot remove owner
    if (memberUserId === cart.ownerId) {
      throw new ForbiddenException('Cannot remove cart owner');
    }

    const member = await this.prisma.sharedCartMember.findUnique({
      where: {
        sharedCartId_userId: {
          sharedCartId: cartId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this cart');
    }

    return this.prisma.sharedCartMember.update({
      where: { id: member.id },
      data: { status: 'REMOVED' },
      include: { user: true, sharedCart: true },
    });
  }

  async leaveCart(cartId: number, userId: number) {
    const cart = await this.getSharedCart(cartId, userId);

    // Owner cannot leave
    if (cart.ownerId === userId) {
      throw new ForbiddenException('Cart owner cannot leave the cart');
    }

    const member = await this.prisma.sharedCartMember.findUnique({
      where: {
        sharedCartId_userId: {
          sharedCartId: cartId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this cart');
    }

    return this.prisma.sharedCartMember.update({
      where: { id: member.id },
      data: { status: 'REMOVED' },
      include: { user: true, sharedCart: true },
    });
  }

  async getCartMembers(cartId: number, userId: number) {
    await this.getSharedCart(cartId, userId);

    return this.prisma.sharedCartMember.findMany({
      where: { sharedCartId: cartId },
      include: { user: true },
    });
  }

  // ===== HELPER METHODS =====
  private async getCartOwner(cartId: number): Promise<number> {
    const cart = await this.prisma.sharedCart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart.ownerId;
  }

  // ===== CHECKOUT =====
  async checkoutSharedCart(cartId: number, userId: number) {
    const cart = await this.getSharedCart(cartId, userId);

    // Only owner can checkout
    if (cart.ownerId !== userId) {
      throw new ForbiddenException('Only cart owner can checkout');
    }

    if (cart.items.length === 0) {
      throw new ForbiddenException('Cart is empty');
    }

    // Calculate total
    let totalAmount = 0;
    const itemsData = cart.items.map((item) => {
      const itemTotal = item.menuItem.price * item.quantity;
      totalAmount += itemTotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      };
    });

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId: cart.ownerId,
        country: (
          await this.prisma.user.findUnique({ where: { id: cart.ownerId } })
        ).country,
        status: 'CREATED',
        totalAmount,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    // Archive cart after checkout
    await this.prisma.sharedCart.update({
      where: { id: cartId },
      data: { status: 'ARCHIVED' },
    });

    return order;
  }
}
