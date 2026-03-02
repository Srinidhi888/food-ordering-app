import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import type { User as PrismaUser } from '@prisma/client';
import { Order } from './entities/order.entity';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order, { name: 'createOrder' })
  @UseGuards(GqlAuthGuard)
  create(@CurrentUser() user: PrismaUser, @Args('createOrderDto') createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user, createOrderDto);
  }

  @Query(() => [Order], { name: 'orders' })
  @UseGuards(GqlAuthGuard)
  findAll(@CurrentUser() user: PrismaUser) {
    return this.ordersService.findAll(user);
  }

  @Query(() => Order, { name: 'order' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.ordersService.findOne(id);
  }

  @Mutation(() => Order, { name: 'checkoutOrder' })
  @UseGuards(GqlAuthGuard)
  checkout(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: PrismaUser) {
    return this.ordersService.checkout(id, user);
  }

  @Mutation(() => Order, { name: 'cancelOrder' })
  @UseGuards(GqlAuthGuard)
  cancel(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: PrismaUser) {
    return this.ordersService.cancel(id, user);
  }
}
