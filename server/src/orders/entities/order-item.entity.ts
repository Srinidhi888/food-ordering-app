import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  orderId: number;

  @Field(() => Int)
  menuItemId: number;

  @Field(() => Int)
  quantity: number;
}
