import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) { }

  findAll(user: User) {
    if (user.role === Role.ADMIN) {
      return this.prisma.restaurant.findMany({ include: { menu: true } });
    }
    return this.prisma.restaurant.findMany({
      where: { country: user.country },
      include: { menu: true },
    });
  }

  findOne(id: number) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: { menu: true },
    });
  }
}
