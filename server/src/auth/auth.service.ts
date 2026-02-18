import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async login(name: string) {
    const user = await this.prisma.user.findFirst({
      where: { name },
    });
    if (!user) {
      throw new NotFoundException(`User with name ${name} not found`);
    }
    return user;
  }
}
