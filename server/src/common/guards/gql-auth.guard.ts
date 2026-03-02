import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const userId = req?.headers['x-user-id'];

    if (!userId) throw new UnauthorizedException('x-user-id header missing');

    const user = await this.prisma.user.findUnique({ where: { id: parseInt(userId as string) } });

    if (!user) throw new UnauthorizedException('User not found');
    req.user = user;
    return true;
  }
}
