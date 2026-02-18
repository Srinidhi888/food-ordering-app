export interface User {
    id: number;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'MEMBER';
    country: 'INDIA' | 'AMERICA';
    payment?: string;
}

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    restaurantId: number;
}

export interface Restaurant {
    id: number;
    name: string;
    country: string;
    menu: MenuItem[];
}

export interface OrderItem {
    id: number;
    menuItemId: number;
    quantity: number;
    menuItem?: MenuItem;
}

export interface Order {
    id: number;
    status: 'CREATED' | 'PLACED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
    country: string;
}
