import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AddCartItemDto {
  @Field(() => Int)
  menuItemId: number;

  @Field(() => Int)
  quantity: number;

  @Field({ nullable: true })
  notes?: string;
}
