import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export interface SharedCartItem {
  id: number;
  menuItemId: number;
  quantity: number;
  addedBy: number;
  menuItem?: {
    id: number;
    name: string;
    price: number;
  };
  addedByUser?: {
    id: number;
    name: string;
  };
  notes?: string;
}

export interface SharedCartMemberUser {
  id: number;
  name: string;
  email: string;
}

export interface SharedCartMember {
  id: number;
  userId: number;
  user?: SharedCartMemberUser;
  role: 'OWNER' | 'MEMBER';
  accessLevel: 'CAN_VIEW' | 'CAN_ADD_ITEMS' | 'CAN_MANAGE_MEMBERS';
  status: 'INVITED' | 'PENDING' | 'ACTIVE' | 'REMOVED';
}

export interface SharedCart {
  id: number;
  name: string;
  restaurantId: number;
  restaurantName: string;
  ownerId: number;
  ownerName: string;
  status: 'ACTIVE' | 'ARCHIVED';
  items: SharedCartItem[];
  members: SharedCartMember[];
  total: number;
}

interface SharedCartContextType {
  sharedCarts: SharedCart[];
  currentCart: SharedCart | null;
  loading: boolean;
  error: string | null;

  // Cart operations
  createSharedCart: (name: string, restaurantId: number) => Promise<SharedCart>;
  getSharedCarts: () => Promise<void>;
  getSharedCart: (cartId: number) => Promise<SharedCart>;
  updateSharedCart: (cartId: number, name: string) => Promise<SharedCart>;
  archiveSharedCart: (cartId: number) => Promise<void>;

  // Item operations
  addCartItem: (cartId: number, menuItemId: number, quantity: number, notes?: string) => Promise<SharedCartItem>;
  updateItemQuantity: (cartId: number, itemId: number, quantity: number) => Promise<SharedCartItem>;
  removeCartItem: (cartId: number, itemId: number) => Promise<void>;
  clearCartItems: (cartId: number) => Promise<void>;

  // Member operations
  inviteMember: (cartId: number, userId: number) => Promise<SharedCartMember>;
  acceptInvitation: (cartId: number) => Promise<SharedCartMember>;
  removeMember: (cartId: number, memberId: number) => Promise<void>;
  leaveCart: (cartId: number) => Promise<void>;
  getCartMembers: (cartId: number) => Promise<SharedCartMember[]>;

  // Checkout
  checkoutSharedCart: (cartId: number) => Promise<any>;
}

const SharedCartContext = createContext<SharedCartContextType | undefined>(undefined);

export function SharedCartProvider({ children }: { children: ReactNode }) {
  const [sharedCarts, setSharedCarts] = useState<SharedCart[]>([]);
  const [currentCart, setCurrentCart] = useState<SharedCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
    setError(errorMessage);
    console.error(errorMessage);
  };

  const createSharedCart = useCallback(
    async (name: string, restaurantId: number): Promise<SharedCart> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation CreateSharedCart($name: String!, $restaurantId: Int!) {
              createSharedCart(createSharedCartDto: { name: $name, restaurantId: $restaurantId }) {
                id
                name
                restaurantId
                ownerId
                status
                items { 
                  id 
                  menuItemId 
                  quantity
                  menuItem {
                    id
                    name
                    price
                  }
                }
                members { 
                  id 
                  userId 
                  role 
                  status 
                }
              }
            }
          `,
          variables: { name, restaurantId },
        });
        const newCart = response.data.data.createSharedCart;
        setSharedCarts([...sharedCarts, newCart]);
        return newCart;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sharedCarts]
  );

  const getSharedCarts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/graphql', {
        query: `
          query {
            mySharedCarts {
              id
              name
              restaurantId
              ownerId
              status
              items { 
                id 
                menuItemId 
                quantity 
                addedBy
                menuItem {
                  id
                  name
                  price
                }
              }
              members { 
                id 
                userId 
                role 
                status
              }
            }
          }
        `,
      });
      const carts = response.data.data.mySharedCarts;
      setSharedCarts(carts);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSharedCart = useCallback(async (cartId: number): Promise<SharedCart> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/graphql', {
        query: `
          query GetCart($id: Int!) {
            sharedCart(id: $id) {
              id
              name
              restaurantId
              ownerId
              status
              items { 
                id 
                menuItemId 
                quantity 
                addedBy 
                menuItem {
                  id
                  name
                  price
                }
                addedByUser {
                  id
                  name
                }
              }
              members { 
                id 
                userId 
                role 
                status
                user {
                  id
                  name
                  email
                }
              }
              owner {
                id
                name
              }
              restaurant {
                id
                name
              }
            }
          }
        `,
        variables: { id: cartId },
      });
      const cart = response.data.data.sharedCart;
      console.log('Cart loaded:', cart);
      setCurrentCart(cart);
      return cart;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSharedCart = useCallback(
    async (cartId: number, name: string): Promise<SharedCart> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation UpdateCart($id: Int!, $name: String!) {
              updateSharedCart(id: $id, updateSharedCartDto: { name: $name }) {
                id
                name
                restaurantId
                ownerId
                status
              }
            }
          `,
          variables: { id: cartId, name },
        });
        const updatedCart = response.data.data.updateSharedCart;
        if (currentCart?.id === cartId) {
          setCurrentCart(updatedCart);
        }
        return updatedCart;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentCart]
  );

  const archiveSharedCart = useCallback(
    async (cartId: number) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/graphql', {
          query: `
            mutation ArchiveCart($id: Int!) {
              archiveSharedCart(id: $id) {
                id
                status
              }
            }
          `,
          variables: { id: cartId },
        });
        if (currentCart?.id === cartId) {
          setCurrentCart(null);
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentCart]
  );

  const addCartItem = useCallback(
    async (cartId: number, menuItemId: number, quantity: number, notes?: string): Promise<SharedCartItem> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation AddItem($cartId: Int!, $menuItemId: Int!, $quantity: Int!, $notes: String) {
              addCartItem(cartId: $cartId, addCartItemDto: { menuItemId: $menuItemId, quantity: $quantity, notes: $notes }) {
                id
                menuItemId
                quantity
                addedBy
                menuItem {
                  id
                  name
                  price
                }
                addedByUser {
                  id
                  name
                }
              }
            }
          `,
          variables: { cartId, menuItemId, quantity, notes },
        });
        return response.data.data.addCartItem;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateItemQuantity = useCallback(
    async (cartId: number, itemId: number, quantity: number): Promise<SharedCartItem> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation UpdateQuantity($cartId: Int!, $itemId: Int!, $quantity: Int!) {
              updateCartItemQuantity(cartId: $cartId, itemId: $itemId, quantity: $quantity) {
                id
                menuItemId
                quantity
                menuItem {
                  id
                  name
                  price
                }
              }
            }
          `,
          variables: { cartId, itemId, quantity },
        });
        return response.data.data.updateCartItemQuantity;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeCartItem = useCallback(
    async (cartId: number, itemId: number) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/graphql', {
          query: `
            mutation RemoveItem($cartId: Int!, $itemId: Int!) {
              removeCartItem(cartId: $cartId, itemId: $itemId) {
                id
              }
            }
          `,
          variables: { cartId, itemId },
        });
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearCartItems = useCallback(
    async (cartId: number) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/graphql', {
          query: `
            mutation ClearCart($cartId: Int!) {
              clearCartItems(cartId: $cartId) {
                id
                items { id }
              }
            }
          `,
          variables: { cartId },
        });
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const inviteMember = useCallback(
    async (cartId: number, userId: number): Promise<SharedCartMember> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation InviteMember($cartId: Int!, $inviteMemberDto: InviteMemberDto!) {
              inviteMember(cartId: $cartId, inviteMemberDto: $inviteMemberDto) {
                id
                userId
                role
                status
              }
            }
          `,
          variables: {
            cartId,
            inviteMemberDto: { userId }
          },
        });
        return response.data.data.inviteMember;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const acceptInvitation = useCallback(
    async (cartId: number): Promise<SharedCartMember> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation AcceptInvite($cartId: Int!) {
              acceptInvitation(cartId: $cartId) {
                id
                userId
                status
              }
            }
          `,
          variables: { cartId },
        });
        return response.data.data.acceptInvitation;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeMember = useCallback(
    async (cartId: number, memberId: number) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/graphql', {
          query: `
            mutation RemoveMember($cartId: Int!, $memberId: Int!) {
              removeMember(cartId: $cartId, memberId: $memberId) {
                id
                status
              }
            }
          `,
          variables: { cartId, memberId },
        });
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const leaveCart = useCallback(
    async (cartId: number) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/graphql', {
          query: `
            mutation LeaveCart($cartId: Int!) {
              leaveCart(cartId: $cartId) {
                id
                status
              }
            }
          `,
          variables: { cartId },
        });
        if (currentCart?.id === cartId) {
          setCurrentCart(null);
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentCart]
  );

  const getCartMembers = useCallback(
    async (cartId: number): Promise<SharedCartMember[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            query GetMembers($cartId: Int!) {
              cartMembers(cartId: $cartId) {
                id
                userId
                role
                status
              }
            }
          `,
          variables: { cartId },
        });
        return response.data.data.cartMembers;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkoutSharedCart = useCallback(
    async (cartId: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/graphql', {
          query: `
            mutation CheckoutCart($cartId: Int!) {
              checkoutSharedCart(cartId: $cartId) {
                id
                status
                totalAmount
              }
            }
          `,
          variables: { cartId },
        });
        if (currentCart?.id === cartId) {
          setCurrentCart(null);
        }
        return response.data.data.checkoutSharedCart;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentCart]
  );

  return (
    <SharedCartContext.Provider
      value={{
        sharedCarts,
        currentCart,
        loading,
        error,
        createSharedCart,
        getSharedCarts,
        getSharedCart,
        updateSharedCart,
        archiveSharedCart,
        addCartItem,
        updateItemQuantity,
        removeCartItem,
        clearCartItems,
        inviteMember,
        acceptInvitation,
        removeMember,
        leaveCart,
        getCartMembers,
        checkoutSharedCart,
      }}
    >
      {children}
    </SharedCartContext.Provider>
  );
}

export function useSharedCart() {
  const context = useContext(SharedCartContext);
  if (context === undefined) {
    throw new Error('useSharedCart must be used within a SharedCartProvider');
  }
  return context;
}
