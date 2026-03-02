import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
