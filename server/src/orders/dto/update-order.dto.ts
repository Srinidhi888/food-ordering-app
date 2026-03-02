import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

// GraphQL will pick up fields from CreateOrderDto since it's decorated
export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
