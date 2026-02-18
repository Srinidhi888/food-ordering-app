import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];

        if (!userId) throw new UnauthorizedException('x-user-id header missing');

        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId as string) },
        });

        if (!user) throw new UnauthorizedException('User not found');
        request.user = user;
        return true;
    }
}
