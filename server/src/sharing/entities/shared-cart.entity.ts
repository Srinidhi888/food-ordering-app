import { ObjectType, Field, Int } from '@nestjs/graphql';
import { SharedCartMember } from './shared-cart-member.entity';
import { SharedCartItem } from './shared-cart-item.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class SharedCart {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  ownerId: number;

  @Field(() => User)
  owner: User;

  @Field(() => Int)
  restaurantId: number;

  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field()
  status: string;

  @Field(() => [SharedCartMember])
  members: SharedCartMember[];

  @Field(() => [SharedCartItem])
  items: SharedCartItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
