import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { User as PrismaUser } from '@prisma/client';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant], { name: 'restaurants' })
  @UseGuards(GqlAuthGuard)
  findAll(@CurrentUser() user: PrismaUser) {
    return this.restaurantsService.findAll(user);
  }
}
