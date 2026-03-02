import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Order } from '../../orders/entities/order.entity';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  role: string;

  @Field()
  country: string;

  @Field({ nullable: true })
  payment?: string;

  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
