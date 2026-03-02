declare module '@prisma/client' {
  export class PrismaClient {
    constructor(...args: any[]);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    [key: string]: any;
  }

  export type User = any;
  export type MenuItem = any;
  export type Restaurant = any;
  export type Order = any;

  export const Role: any;
  export type Role = any;

  export const Country: any;
  export type Country = any;

  export const OrderStatus: any;
  export type OrderStatus = any;

  export type Prisma = any;
}
