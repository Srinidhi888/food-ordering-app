import { Module } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { SharingResolver } from './sharing.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SharingResolver, SharingService],
  exports: [SharingService],
})
export class SharingModule {}
