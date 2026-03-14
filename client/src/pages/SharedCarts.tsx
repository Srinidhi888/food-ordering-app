import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedCart } from '../context/SharedCartContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, Archive, Share2, CheckCircle, Clock } from 'lucide-react';

interface PendingInvitation {
  id: number;
  sharedCartId: number;
  cartName: string;
  restaurantName: string;
  ownerName: string;
  status: string;
}

export default function SharedCartList() {
  const { sharedCarts, getSharedCarts, createSharedCart, archiveSharedCart, loading, acceptInvitation } = useSharedCart();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cartName, setCartName] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getSharedCarts();
    fetchPendingInvitations();
    fetchRestaurants();
  }, []);

  const fetchPendingInvitations = async () => {
    try {
      const response = await api.post('/graphql', {
        query: `
          query {
            mySharedCarts {
              id
              name
              restaurant {
                name
              }
              owner {
                name
              }
              members {
                userId
                status
              }
            }
          }
        `,
      });
      
      const carts = response.data.data.mySharedCarts;
      const pending = carts
        .filter((cart: any) => {
          const member = cart.members.find((m: any) => m.userId === currentUser.id);
          return member && member.status === 'INVITED';
        })
        .map((cart: any) => ({
          id: cart.id,
          sharedCartId: cart.id,
          cartName: cart.name,
          restaurantName: cart.restaurant.name,
          ownerName: cart.owner.name,
          status: 'INVITED',
        }));
      
      setPendingInvites(pending);
    } catch (err) {
      console.error('Failed to fetch pending invitations:', err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.post('/graphql', {
        query: `
          query {
            restaurants {
              id
              name
            }
          }
        `,
      });
      setRestaurants(response.data.data.restaurants || []);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    }
  };

  const handleCreateCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      alert('Please select a restaurant');
      return;
    }
    try {
      await createSharedCart(cartName, selectedRestaurant);
      setCartName('');
      setSelectedRestaurant(null);
      setShowCreateModal(false);
      getSharedCarts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptInvite = async (cartId: number) => {
    try {
      await acceptInvitation(cartId);
      await fetchPendingInvitations();
      await getSharedCarts();
    } catch (err) {
      console.error(err);
    }
  };

  const ownedCarts = sharedCarts.filter(cart => cart.ownerId === currentUser.id);
  const joinedCarts = sharedCarts.filter(cart => cart.ownerId !== currentUser.id);

  // Render individual cart card
  const CartCard = ({ cart, idx, onArchive, navigate }: { cart: any; idx: number; onArchive?: (id: number) => void; navigate: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="glass glass-hover"
      style={{ padding: 24, cursor: 'pointer' }}
      onClick={() => navigate(`/shared-carts/${cart.id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
            {cart.name}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            {cart.restaurantName}
          </p>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: cart.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
          fontSize: '0.7rem', fontWeight: 700,
          color: cart.status === 'ACTIVE' ? '#6ee7b7' : '#94a3b8',
        }}>
          {cart.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: '12px', borderRadius: 8, background: 'rgba(124,58,237,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>Items</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>{cart.items.length}</p>
        </div>
        <div style={{ padding: '12px', borderRadius: 8, background: 'rgba(6,182,212,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>Members</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#67e8f9' }}>{cart.members.length}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/shared-carts/${cart.id}`);
          }}
          style={{
            flex: 1, padding: '10px', borderRadius: 8,
            background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)',
            color: '#a78bfa', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.85rem', transition: 'all 0.2s',
          }}
        >
          View Cart
        </motion.button>
        {onArchive && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onArchive(cart.id);
            }}
            style={{
              padding: '10px', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Archive size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
          Shared Carts
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Plus size={18} /> New Cart
        </motion.button>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} style={{ color: '#fbbf24' }} />
            Carts Shared With You
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
            {pendingInvites.map((invite, idx) => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass"
                style={{ padding: 24, border: '2px solid rgba(251,191,36,0.3)' }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', marginBottom: 8 }}>
                    {invite.cartName}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    📍 {invite.restaurantName}
                  </p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: 8 }}>
                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>{invite.ownerName}</span> shared their cart with you
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAcceptInvite(invite.sharedCartId)}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 8,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none', color: 'white', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.9rem', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <CheckCircle size={16} /> Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPendingInvites(pendingInvites.filter(p => p.id !== invite.id));
                    }}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#fca5a5', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                    }}
                  >
                    Decline
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* My Carts */}
      {ownedCarts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginBottom: 40 }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
            My Carts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
            {ownedCarts.map((cart, idx) => (
              <CartCard key={cart.id} cart={cart} idx={idx} onArchive={archiveSharedCart} navigate={navigate} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Joined Carts */}
      {joinedCarts.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
            Joined Carts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
            {joinedCarts.map((cart, idx) => (
              <CartCard key={cart.id} cart={cart} idx={idx} navigate={navigate} />
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : ownedCarts.length === 0 && joinedCarts.length === 0 && pendingInvites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
          <Share2 size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No shared carts yet</p>
          <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Create a shared cart to collaborate with others</p>
        </div>
      ) : null}

      {/* Create Cart Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCreateModal(false)}
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
              Create Shared Cart
            </h2>
            <form onSubmit={handleCreateCart}>
              <input
                type="text"
                placeholder="Cart name (e.g., Office Lunch)"
                value={cartName}
                onChange={(e) => setCartName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9', marginBottom: 20, fontSize: '0.95rem',
                }}
              />
              <select
                value={selectedRestaurant || ''}
                onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9', marginBottom: 20, fontSize: '0.95rem',
                }}
              >
                <option value="">Select a restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 8,
                    background: 'rgba(100,116,139,0.2)', border: 'none',
                    color: '#cbd5e1', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  style={{
                    flex: 1, padding: '12px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                    border: 'none', color: 'white', cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Create
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
