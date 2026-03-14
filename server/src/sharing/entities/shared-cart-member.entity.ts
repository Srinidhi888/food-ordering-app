import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { SharedCart } from './shared-cart.entity';

@ObjectType()
export class SharedCartMember {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  sharedCartId: number;

  @Field(() => SharedCart)
  sharedCart: SharedCart;

  @Field(() => Int)
  userId: number;

  @Field(() => User)
  user: User;

  @Field()
  role: string;

  @Field()
  accessLevel: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  joinedAt?: Date;

  @Field()
  invitedAt: Date;
}
