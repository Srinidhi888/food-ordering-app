import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OrderItem } from './order-item.entity';

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field()
  status: string;

  @Field()
  country: string;

  @Field(() => Int)
  userId: number;

  @Field(() => [OrderItem], { nullable: true })
  items?: OrderItem[];

  @Field(() => Int, { nullable: true })
  totalAmount?: number;
}
