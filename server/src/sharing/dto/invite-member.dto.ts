import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class InviteMemberDto {
  @Field(() => Int)
  userId: number;

  @Field({ nullable: true })
  accessLevel?: string;
}
