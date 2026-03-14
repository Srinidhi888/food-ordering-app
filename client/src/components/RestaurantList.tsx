import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Restaurant } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Plus, Check, MapPin, Utensils, Search } from 'lucide-react';

const FOOD_EMOJIS: Record<string, string> = {
    'Butter Chicken': '🍛', 'Paneer Tikka': '🥘', 'Burger': '🍔',
    'Pizza': '🍕', 'Biryani': '🍚', 'Pasta': '🍝',
};
const getEmoji = (name: string) => FOOD_EMOJIS[name] ?? '🍽️';

export default function RestaurantList() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [added, setAdded] = useState<Record<number, boolean>>({});
    const { addToCartWithRestaurantCheck } = useCart();
    const [conflictRestaurant, setConflictRestaurant] = useState<string | null>(null);

    useEffect(() => {
        api.get('/restaurants')
            .then(r => setRestaurants(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = (item: any) => {
        const result = addToCartWithRestaurantCheck(item);
        
        if (result.cleared && result.conflictRestaurantId) {
            const conflictRestaurant = restaurants.find(r => 
                r.menu?.some(m => m.restaurantId === result.conflictRestaurantId)
            );
            setConflictRestaurant(conflictRestaurant?.name || 'another restaurant');
        }
        
        setAdded(prev => ({ ...prev, [item.id]: true }));
        setTimeout(() => setAdded(prev => ({ ...prev, [item.id]: false })), 1200);
    };

    const filtered = restaurants.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.menu?.some(m => m.name.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div className="spinner" />
        </div>
    );

    return (
        <div className="container page-wrapper">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 6 }}>
                        Restaurants
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} available in your region
                    </p>
                </div>
                <div style={{ position: 'relative', width: 260 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search restaurants or dishes..."
                        style={{ paddingLeft: 38, fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
                    <Utensils size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No restaurants found</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 24 }}>
                {filtered.map((restaurant, idx) => (
                    <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                        className="glass glass-hover"
                        style={{ overflow: 'hidden' }}
                    >
                        {/* Restaurant Banner */}
                        <div style={{
                            padding: '20px 24px',
                            background: `linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)`,
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: `linear-gradient(135deg, ${restaurant.country === 'INDIA' ? '#ea580c, #d97706' : '#2563eb, #4f46e5'})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }}>
                                    {restaurant.country === 'INDIA' ? '🇮🇳' : '🇺🇸'}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                                        {restaurant.name}
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        <MapPin size={12} style={{ color: '#64748b' }} />
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                            {restaurant.country === 'INDIA' ? 'India' : 'United States'}
                                        </span>
                                        <span style={{ color: '#1e293b' }}>·</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {restaurant.menu?.length ?? 0} items
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 10px', borderRadius: 99,
                                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                                fontSize: '0.7rem', fontWeight: 700, color: '#6ee7b7',
                            }}>
                                OPEN
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div style={{ padding: '16px 24px 20px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                                Menu
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {restaurant.menu?.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 + i * 0.06 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'background 0.2s, border-color 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 22 }}>{getEmoji(item.name)}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 700, fontFamily: 'monospace' }}>
                                                    ₹{item.price}
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleAdd(item)}
                                            style={{
                                                width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                                background: added[item.id]
                                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                                    : 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: added[item.id] ? '0 0 12px rgba(16,185,129,0.4)' : '0 0 12px rgba(124,58,237,0.3)',
                                                transition: 'all 0.3s',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {added[item.id] ? <Check size={16} /> : <Plus size={16} />}
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Restaurant Conflict Modal */}
            {conflictRestaurant && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setConflictRestaurant(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 999,
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                            backdropFilter: 'blur(10px)', borderRadius: 20,
                            padding: '32px', maxWidth: 420, border: '1px solid rgba(148,163,184,0.2)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'rgba(239,68,68,0.15)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                            }}>
                                <span style={{ fontSize: 32 }}>⚠️</span>
                            </div>
                            <h2 style={{
                                fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9',
                                marginBottom: 12, letterSpacing: '-0.02em',
                            }}>
                                Restaurant Changed
                            </h2>
                            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                                You have items from <span style={{ fontWeight: 700, color: '#fbbf24' }}>{conflictRestaurant}</span> in your cart.
                                <br />
                                These items have been removed to start a new order.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setConflictRestaurant(null)}
                                style={{
                                    width: '100%', padding: '12px 20px', borderRadius: 12,
                                    border: 'none', background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                    color: 'white', fontWeight: 600, fontSize: '0.95rem',
                                    cursor: 'pointer', transition: 'all 0.3s',
                                    boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                                }}
                            >
                                Got it!
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
