import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem } from '../types';

interface CartItem extends MenuItem {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: number) => void;
    clearCart: () => void;
    total: number;
    currentRestaurantId: number | null;
    addToCartWithRestaurantCheck: (item: MenuItem) => { conflictRestaurantId?: number; cleared: boolean };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [currentRestaurantId, setCurrentRestaurantId] = useState<number | null>(null);

    const addToCart = (item: MenuItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const addToCartWithRestaurantCheck = (item: MenuItem) => {
        let cleared = false;
        let conflictRestaurantId: number | undefined;

        setItems((prev) => {
            // If cart is empty, just set the restaurant
            if (prev.length === 0) {
                setCurrentRestaurantId(item.restaurantId);
                return [{ ...item, quantity: 1 }];
            }

            // Check if item is from a different restaurant
            if (currentRestaurantId && currentRestaurantId !== item.restaurantId) {
                conflictRestaurantId = currentRestaurantId;
                cleared = true;
                // Clear cart and add new item
                setCurrentRestaurantId(item.restaurantId);
                return [{ ...item, quantity: 1 }];
            }

            // Same restaurant, add normally
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });

        return { conflictRestaurantId, cleared };
    };

    const removeFromCart = (itemId: number) => {
        setItems((prev) => {
            const updated = prev.filter((i) => i.id !== itemId);
            if (updated.length === 0) {
                setCurrentRestaurantId(null);
            }
            return updated;
        });
    };

    const clearCart = () => {
        setItems([]);
        setCurrentRestaurantId(null);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, currentRestaurantId, addToCartWithRestaurantCheck }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
