import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto'; // Using provided DTO or custom

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // ... CRUD placeholders ...

  async updatePayment(id: number, payment: string, currentUser: User) {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only Admin can update payment methods');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { payment },
    });
  }

  // Basic CRUD for completeness (optional based on requirements)
  findAll() { return this.prisma.user.findMany(); }
  findOne(id: number) { return this.prisma.user.findUnique({ where: { id } }); }
}
