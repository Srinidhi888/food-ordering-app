import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsResolver } from './restaurants.resolver';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Module({
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantsResolver, GqlAuthGuard],
})
export class RestaurantsModule {}
