import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MenuItem } from '../../restaurants/entities/menu-item.entity';
import { User } from '../../users/entities/user.entity';
import { SharedCart } from './shared-cart.entity';

@ObjectType()
export class SharedCartItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  sharedCartId: number;

  @Field(() => SharedCart)
  sharedCart: SharedCart;

  @Field(() => Int)
  menuItemId: number;

  @Field(() => MenuItem)
  menuItem: MenuItem;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  addedBy: number;

  @Field(() => User)
  addedByUser: User;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  addedAt: Date;
}
