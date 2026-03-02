import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class MenuItem {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  price: number;

  @Field(() => Int)
  restaurantId: number;
}
