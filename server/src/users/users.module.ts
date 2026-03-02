import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersResolver, GqlAuthGuard],
})
export class UsersModule {}
