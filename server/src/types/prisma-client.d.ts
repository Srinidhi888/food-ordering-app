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
  export type SharedCart = any;
  export type SharedCartMember = any;
  export type SharedCartItem = any;

  export const Role: any;
  export type Role = any;

  export const Country: any;
  export type Country = any;

  export const OrderStatus: any;
  export type OrderStatus = any;

  export const SharedCartStatus: any;
  export type SharedCartStatus = any;

  export const CartMemberRole: any;
  export type CartMemberRole = any;

  export const AccessLevel: any;
  export type AccessLevel = any;

  export const MemberStatus: any;
  export type MemberStatus = any;

  export type Prisma = any;
}
