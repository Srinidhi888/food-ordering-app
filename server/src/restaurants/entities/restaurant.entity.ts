import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MenuItem } from './menu-item.entity';

@ObjectType()
export class Restaurant {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  country: string;

  @Field(() => [MenuItem], { nullable: true })
  menu?: MenuItem[];
}
