import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  menuItemId: number;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderDto {
  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}
