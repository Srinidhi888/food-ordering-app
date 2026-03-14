import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { SharedCart } from './entities/shared-cart.entity';
import { SharedCartMember } from './entities/shared-cart-member.entity';
import { SharedCartItem } from './entities/shared-cart-item.entity';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateSharedCartDto } from './dto/create-shared-cart.dto';
import { UpdateSharedCartDto } from './dto/update-shared-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { Order } from '../orders/entities/order.entity';
import type { User as PrismaUser } from '@prisma/client';

@Resolver(() => SharedCart)
export class SharingResolver {
  constructor(private readonly sharingService: SharingService) {}

  // ===== SHARED CART QUERIES =====
  @Query(() => SharedCart, { name: 'sharedCart' })
  @UseGuards(GqlAuthGuard)
  getSharedCart(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.getSharedCart(id, user.id);
  }

  @Query(() => [SharedCart], { name: 'mySharedCarts' })
  @UseGuards(GqlAuthGuard)
  getUserSharedCarts(@CurrentUser() user: PrismaUser) {
    return this.sharingService.getUserSharedCarts(user.id);
  }

  // ===== SHARED CART MUTATIONS =====
  @Mutation(() => SharedCart, { name: 'createSharedCart' })
  @UseGuards(GqlAuthGuard)
  createSharedCart(
    @CurrentUser() user: PrismaUser,
    @Args('createSharedCartDto') createSharedCartDto: CreateSharedCartDto,
  ) {
    return this.sharingService.createSharedCart(user, createSharedCartDto);
  }

  @Mutation(() => SharedCart, { name: 'updateSharedCart' })
  @UseGuards(GqlAuthGuard)
  updateSharedCart(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateSharedCartDto') updateSharedCartDto: UpdateSharedCartDto,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.updateSharedCart(id, user.id, updateSharedCartDto);
  }

  @Mutation(() => SharedCart, { name: 'archiveSharedCart' })
  @UseGuards(GqlAuthGuard)
  archiveSharedCart(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.archiveSharedCart(id, user.id);
  }

  // ===== CART ITEMS MUTATIONS =====
  @Mutation(() => SharedCartItem, { name: 'addCartItem' })
  @UseGuards(GqlAuthGuard)
  addCartItem(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('addCartItemDto') addCartItemDto: AddCartItemDto,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.addCartItem(cartId, user.id, addCartItemDto);
  }

  @Mutation(() => SharedCartItem, { name: 'updateCartItemQuantity' })
  @UseGuards(GqlAuthGuard)
  updateCartItemQuantity(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('itemId', { type: () => Int }) itemId: number,
    @Args('quantity', { type: () => Int }) quantity: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.updateCartItemQuantity(cartId, user.id, itemId, quantity);
  }

  @Mutation(() => SharedCartItem, { name: 'removeCartItem' })
  @UseGuards(GqlAuthGuard)
  removeCartItem(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('itemId', { type: () => Int }) itemId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.removeCartItem(cartId, user.id, itemId);
  }

  @Mutation(() => SharedCart, { name: 'clearCartItems' })
  @UseGuards(GqlAuthGuard)
  clearCartItems(
    @Args('cartId', { type: () => Int }) cartId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.clearCartItems(cartId, user.id);
  }

  // ===== MEMBER MANAGEMENT MUTATIONS =====
  @Mutation(() => SharedCartMember, { name: 'inviteMember' })
  @UseGuards(GqlAuthGuard)
  inviteMember(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('inviteMemberDto') inviteMemberDto: InviteMemberDto,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.inviteMember(cartId, user.id, inviteMemberDto);
  }

  @Mutation(() => SharedCartMember, { name: 'acceptInvitation' })
  @UseGuards(GqlAuthGuard)
  acceptInvitation(
    @Args('cartId', { type: () => Int }) cartId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.acceptInvitation(cartId, user.id);
  }

  @Mutation(() => SharedCartMember, { name: 'removeMember' })
  @UseGuards(GqlAuthGuard)
  removeMember(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('memberId', { type: () => Int }) memberId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.removeMember(cartId, user.id, memberId);
  }

  @Mutation(() => SharedCartMember, { name: 'leaveCart' })
  @UseGuards(GqlAuthGuard)
  leaveCart(
    @Args('cartId', { type: () => Int }) cartId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.leaveCart(cartId, user.id);
  }

  @Query(() => [SharedCartMember], { name: 'cartMembers' })
  @UseGuards(GqlAuthGuard)
  getCartMembers(
    @Args('cartId', { type: () => Int }) cartId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.getCartMembers(cartId, user.id);
  }

  // ===== CHECKOUT =====
  @Mutation(() => Order, { name: 'checkoutSharedCart' })
  @UseGuards(GqlAuthGuard)
  checkoutSharedCart(
    @Args('cartId', { type: () => Int }) cartId: number,
    @CurrentUser() user: PrismaUser,
  ) {
    return this.sharingService.checkoutSharedCart(cartId, user.id);
  }
}
