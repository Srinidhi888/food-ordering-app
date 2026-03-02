import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { User as PrismaUser } from '@prisma/client';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  findAll(@CurrentUser() user: PrismaUser) {
    if (user.role !== 'ADMIN') throw new Error('Only Admin can view all users');
    return this.usersService.findAll();
  }

  @Mutation(() => User, { name: 'updatePayment' })
  @UseGuards(GqlAuthGuard)
  updatePayment(@Args('id', { type: () => Int }) id: number, @Args('payment') payment: string, @CurrentUser() user: PrismaUser) {
    return this.usersService.updatePayment(id, payment, user);
  }
}
