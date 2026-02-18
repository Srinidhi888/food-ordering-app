import { Controller, Get, Patch, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { User } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /** GET /users — Admin only: list all users */
  @Get()
  findAll(@CurrentUser() user: User) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only Admin can view all users');
    }
    return this.usersService.findAll();
  }

  /** PATCH /users/:id/payment — Admin only: update payment method */
  @Patch(':id/payment')
  updatePayment(
    @Param('id') id: string,
    @Body('payment') payment: string,
    @CurrentUser() user: User,
  ) {
    return this.usersService.updatePayment(+id, payment, user);
  }
}
