export class CreateOrderDto {
    items: { menuItemId: number; quantity: number }[];
}
