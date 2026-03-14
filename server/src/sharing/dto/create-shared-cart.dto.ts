import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateSharedCartDto {
  @Field()
  name: string;

  @Field(() => Int)
  restaurantId: number;
}
