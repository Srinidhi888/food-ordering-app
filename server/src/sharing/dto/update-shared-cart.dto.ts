import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateSharedCartDto } from './create-shared-cart.dto';

@InputType()
export class UpdateSharedCartDto extends PartialType(CreateSharedCartDto) {}
