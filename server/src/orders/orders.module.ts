import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersResolver } from './orders.resolver';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersResolver, GqlAuthGuard],
})
export class OrdersModule {}
