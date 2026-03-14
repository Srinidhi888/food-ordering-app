import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedCart } from '../context/SharedCartContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Minus, Trash2, LogOut, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';

const FOOD_EMOJIS: Record<string, string> = {
  'Butter Chicken': '🍛', 'Paneer Tikka': '🥘', 'Burger': '🍔', 'Pizza': '🍕',
  'Biryani': '🍚', 'Pasta': '🍝',
};
const getEmoji = (name: string) => FOOD_EMOJIS[name] ?? '🍽️';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  restaurantId: number;
}

export default function SharedCartDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCart, getSharedCart, addCartItem, removeCartItem, updateItemQuantity, loading, inviteMember, checkoutSharedCart, archiveSharedCart } = useSharedCart();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [menuQuantities, setMenuQuantities] = useState<Record<number, number>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [updatingQty, setUpdatingQty] = useState<number | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (id) {
      getSharedCart(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (currentCart) {
      console.log('Loading restaurant menu and users...');
      fetchRestaurantMenu();
      fetchUsers();
    }
  }, [currentCart?.id]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.post('/graphql', {
        query: `
          query {
            users {
              id
              email
              name
            }
          }
        `,
      });
      console.log('Users API response:', response);

      if (response.data.errors) {
        console.error('GraphQL Errors:', response.data.errors);
        setUsers([]);
        return;
      }

      const fetchedUsers = response.data?.data?.users || [];
      console.log('Users fetched successfully:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Failed to fetch users - full error:', err);
      setUsers([]);
    }
  };

  const fetchRestaurantMenu = async () => {
    if (!currentCart?.restaurantId) return;
    try {
      const response = await api.post('/graphql', {
        query: `
          query GetRestaurant($id: Int!) {
            restaurant(id: $id) {
              id
              name
              menu {
                id
                name
                price
                restaurantId
              }
            }
          }
        `,
        variables: { id: currentCart.restaurantId },
      });
      const items = response.data.data?.restaurant?.menu || [];
      console.log('Menu items loaded:', items);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setMenuItems([]);
    }
  };

  const handleAddItem = async (item: MenuItem) => {
    const qty = menuQuantities[item.id] ?? 1;
    setAdding(item.id);
    try {
      await addCartItem(Number(id), item.id, qty);
      // Reset quantity picker for this item back to 1 after adding
      setMenuQuantities(prev => ({ ...prev, [item.id]: 1 }));
      await getSharedCart(Number(id));
    } catch (err) {
      console.error('Failed to add item:', err);
      alert('Failed to add item to cart');
    } finally {
      setAdding(null);
    }
  };

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    setUpdatingQty(itemId);
    try {
      if (newQty <= 0) {
        await removeCartItem(Number(id), itemId);
      } else {
        await updateItemQuantity(Number(id), itemId, newQty);
      }
      await getSharedCart(Number(id));
    } catch (err) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity');
    } finally {
      setUpdatingQty(null);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    setDeleting(itemId);
    try {
      console.log('Deleting item:', itemId);
      await removeCartItem(Number(id), itemId);
      console.log('Item deleted successfully, refreshing cart...');
      await getSharedCart(Number(id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const handleInviteMember = async (userId: number) => {
    setInviteLoading(true);
    try {
      console.log('Inviting member with userId:', userId);
      await inviteMember(Number(id), userId);
      console.log('Member invited successfully');
      setShowInviteModal(false);
      await getSharedCart(Number(id));
    } catch (err) {
      console.error('Failed to invite member:', err);
      alert(`Failed to invite member: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading || !currentCart) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
        <div className="spinner" />
      </div>
    );
  }

  const isOwner = currentCart.ownerId === currentUser.id;
  const total = currentCart.items.reduce((sum, item) => sum + (item.menuItem?.price || 0) * item.quantity, 0);
  // Recomputed every render from currentCart.items so it's always in sync after addCartItem refreshes the cart
  const cartItemIds = new Set(currentCart.items.map(item => item.menuItemId));
  return (
    <div className="container page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {currentCart.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Shared with {currentCart.members.length} {currentCart.members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMembersModal(true)}
            className="glass"
            style={{
              padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600,
            }}
          >
            <Users size={18} /> Members
          </motion.button>
          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (confirm('Are you sure you want to delete this shared cart?')) {
                  try {
                    await archiveSharedCart(Number(id));
                    navigate('/shared-carts');
                  } catch (err) {
                    alert('Failed to delete cart');
                  }
                }
              }}
              style={{
                padding: '12px 16px', borderRadius: 12, border: 'none',
                background: 'rgba(239,68,68,0.2)', color: '#fca5a5', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600,
              }}
            >
              <Trash2 size={18} /> Delete Cart
            </motion.button>
          )}
          {!isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/shared-carts');
              }}
              style={{
                padding: '12px 16px', borderRadius: 12, border: 'none',
                background: 'rgba(239,68,68,0.2)', color: '#fca5a5', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600,
              }}
            >
              <LogOut size={18} /> Leave
            </motion.button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          {/* Add Items from Menu */}
          <motion.div
            className="glass"
            style={{ marginBottom: 24, padding: 20 }}
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.95rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} /> Add Items From Menu
              </span>
              {showMenu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {menuItems.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                      Loading menu items...
                    </p>
                  ) : (
                    menuItems.map((item) => {
                      const alreadyInCart = cartItemIds.has(item.id);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 14px', borderRadius: 10,
                            background: alreadyInCart ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
                            border: alreadyInCart ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                            opacity: alreadyInCart ? 0.75 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 18 }}>{getEmoji(item.name)}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 700 }}>
                                ₹{item.price}
                              </div>
                            </div>
                          </div>
                          {alreadyInCart ? (
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 700, color: '#6ee7b7',
                              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)',
                              borderRadius: 99, padding: '4px 10px', whiteSpace: 'nowrap',
                            }}>
                              ✓ In cart
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {/* Quantity stepper */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 6px', border: '1px solid rgba(124,58,237,0.2)' }}>
                                <button
                                  onClick={() => setMenuQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1) }))}
                                  style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '0 2px', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                                >
                                  <Minus size={13} />
                                </button>
                                <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', minWidth: 18, textAlign: 'center' }}>
                                  {menuQuantities[item.id] ?? 1}
                                </span>
                                <button
                                  onClick={() => setMenuQuantities(prev => ({ ...prev, [item.id]: Math.min(20, (prev[item.id] ?? 1) + 1) }))}
                                  style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '0 2px', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                              {/* Add button */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddItem(item)}
                                disabled={adding === item.id}
                                style={{
                                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: adding === item.id ? 'not-allowed' : 'pointer',
                                  background: adding === item.id ? 'rgba(107,114,128,0.3)' : 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                  color: 'white', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4,
                                  boxShadow: '0 0 10px rgba(124,58,237,0.3)', whiteSpace: 'nowrap',
                                }}
                              >
                                {adding === item.id ? '...' : <><Plus size={12} /> Add</>}
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Current Items Section */}
          {currentCart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
              <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No items added yet</p>
              <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Add items from the menu above to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>
                Cart Items ({currentCart.items.length})
              </h3>
              <AnimatePresence>
                {currentCart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="glass"
                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    }}>
                      {getEmoji(item.menuItem?.name || '')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: 4 }}>
                        {item.menuItem?.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
                        Added by <span style={{ color: '#a78bfa' }}>{item.addedByUser?.name}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        ₹{item.menuItem?.price} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a78bfa', fontFamily: 'monospace', marginRight: 12 }}>
                      ₹{(item.menuItem?.price || 0) * item.quantity}
                    </div>
                    {/* Quantity controls — visible to ALL cart members */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingQty === item.id}
                        style={{
                          background: (item.quantity <= 1 || updatingQty === item.id) ? 'rgba(107,114,128,0.3)' : 'rgba(124,58,237,0.2)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          borderRadius: 8, padding: 8,
                          cursor: (item.quantity <= 1 || updatingQty === item.id) ? 'not-allowed' : 'pointer',
                          color: '#a78bfa', display: 'flex',
                          opacity: (item.quantity <= 1 || updatingQty === item.id) ? 0.4 : 1,
                        }}
                      >
                        <Minus size={16} />
                      </motion.button>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, minWidth: 22, textAlign: 'center', fontSize: '0.95rem' }}>
                        {updatingQty === item.id ? '...' : item.quantity}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingQty === item.id}
                        style={{
                          background: updatingQty === item.id ? 'rgba(107,114,128,0.3)' : 'rgba(124,58,237,0.2)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          borderRadius: 8, padding: 8,
                          cursor: updatingQty === item.id ? 'not-allowed' : 'pointer',
                          color: '#a78bfa', display: 'flex',
                          opacity: updatingQty === item.id ? 0.4 : 1,
                        }}
                      >
                        <Plus size={16} />
                      </motion.button>

                      {/* Delete — only adder or owner can remove the item */}
                      {(item.addedBy === currentUser.id || isOwner) && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleting === item.id}
                          style={{
                            background: deleting === item.id ? 'rgba(107,114,128,0.3)' : 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, padding: 8,
                            cursor: deleting === item.id ? 'not-allowed' : 'pointer',
                            color: '#fca5a5', display: 'flex',
                            opacity: deleting === item.id ? 0.5 : 1,
                          }}
                        >
                          {deleting === item.id ? <span>...</span> : <Trash2 size={16} />}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="glass" style={{ padding: 28, position: 'sticky', top: 80 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 24, color: '#f1f5f9' }}>
            Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>₹{total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>GST (5%)</span>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>₹{Math.round(total * 0.05)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Delivery</span>
              <span style={{ fontWeight: 600, color: '#6ee7b7' }}>Free</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#7c3aed', fontFamily: 'monospace' }}>
                ₹{total + Math.round(total * 0.05)}
              </span>
            </div>
          </div>

          {isOwner && currentCart.items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => checkoutSharedCart(Number(id)).then(() => navigate('/orders'))}
              style={{
                width: '100%', padding: '12px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              Place Order
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/shared-carts')}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 12,
              background: 'rgba(100,116,139,0.2)', color: '#cbd5e1', border: 'none',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Back to Carts
          </motion.button>
        </div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowMembersModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              borderRadius: 20, padding: 32, maxWidth: 420,
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
              Cart Members ({currentCart.members.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {currentCart.members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {/* Avatar initials */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: member.role === 'OWNER'
                          ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                          : 'linear-gradient(135deg, #334155, #475569)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem', color: 'white',
                      }}>
                        {(member.user?.name || '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem', margin: 0 }}>
                          {member.user?.name || 'Unknown'}
                          {member.role === 'OWNER' && (
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24',
                              background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
                              borderRadius: 99, padding: '2px 7px', marginLeft: 8, verticalAlign: 'middle',
                            }}>Owner</span>
                          )}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          {member.user?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Status pill */}
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, borderRadius: 99, padding: '3px 10px',
                    background: member.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : member.status === 'INVITED' ? 'rgba(251,191,36,0.15)' : 'rgba(100,116,139,0.15)',
                    color: member.status === 'ACTIVE' ? '#6ee7b7' : member.status === 'INVITED' ? '#fcd34d' : '#94a3b8',
                    border: member.status === 'ACTIVE' ? '1px solid rgba(16,185,129,0.3)' : member.status === 'INVITED' ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(100,116,139,0.3)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
            {isOwner && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowMembersModal(false);
                  setShowInviteModal(true);
                }}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Plus size={16} /> Invite Member
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInviteModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              borderRadius: 20, padding: 32, maxWidth: 420,
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
              Invite Member
            </h2>
            <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 20 }}>
              {(() => {
                console.log('Invite Modal - Users:', users, 'Cart Members:', currentCart?.members);
                const availableUsers = users.filter((u) => !currentCart.members.some((m: any) => m.userId === u.id) && u.id !== currentUser.id);
                return availableUsers.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    Loading users...
                  </p>
                ) : (
                  availableUsers.map((user) => (
                    <motion.button
                      key={user.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInviteMember(user.id)}
                      disabled={inviteLoading}
                      style={{
                        width: '100%', padding: '12px 16px', marginBottom: 8, borderRadius: 8,
                        background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)',
                        color: '#a78bfa', cursor: inviteLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600, textAlign: 'left', opacity: inviteLoading ? 0.5 : 1,
                      }}
                    >
                      {inviteLoading ? '...' : `${user.name} (${user.email})`}
                    </motion.button>
                  ))
                );
              })()}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInviteModal(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: 8,
                background: 'rgba(100,116,139,0.2)', border: 'none',
                color: '#cbd5e1', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
