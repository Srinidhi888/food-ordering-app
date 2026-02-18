import { Controller, Get, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { User } from '@prisma/client';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) { }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.restaurantsService.findAll(user);
  }
}
