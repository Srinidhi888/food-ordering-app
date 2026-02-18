import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, CreditCard, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOOD_EMOJIS: Record<string, string> = {
    'Butter Chicken': '🍛', 'Paneer Tikka': '🥘', 'Burger': '🍔', 'Pizza': '🍕',
};
const getEmoji = (name: string) => FOOD_EMOJIS[name] ?? '🍽️';

export default function Cart() {
    const { items, removeFromCart, total, clearCart } = useCart();
    const navigate = useNavigate();

    const tax = Math.round(total * 0.05);
    const grandTotal = total + tax;

    const handleCheckout = async () => {
        try {
            const orderItems = items.map(i => ({ menuItemId: i.id, quantity: i.quantity }));
            const res = await api.post('/orders', { items: orderItems });
            await api.post(`/orders/${res.data.id}/checkout`);
            clearCart();
            navigate('/orders');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Checkout failed. Make sure you have a payment method set.');
        }
    };

    if (items.length === 0) {
        return (
            <div className="container page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500, textAlign: 'center' }}>
                <div style={{ fontSize: 80, marginBottom: 24, opacity: 0.3 }}>🛒</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>Your cart is empty</h2>
                <p style={{ color: '#64748b', marginBottom: 32, maxWidth: 360 }}>
                    Browse our restaurants and add some delicious items to get started.
                </p>
                <button onClick={() => navigate('/')} className="btn btn-primary btn-lg" style={{ gap: 8 }}>
                    Browse Menu <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="container page-wrapper">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 32 }}>
                Your Cart
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <AnimatePresence>
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="glass"
                                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
                            >
                                <div style={{
                                    width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                                }}>
                                    {getEmoji(item.name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: 4 }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        ₹{item.price} × {item.quantity}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a78bfa', fontFamily: 'monospace', marginRight: 12 }}>
                                    ₹{item.price * item.quantity}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    style={{
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fca5a5',
                                        display: 'flex', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="glass" style={{ padding: 28, position: 'sticky', top: 80 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 24, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                        Order Summary
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                        {[
                            { label: 'Subtotal', value: `₹${total}` },
                            { label: 'GST (5%)', value: `₹${tax}` },
                            { label: 'Delivery', value: 'Free', green: true },
                        ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>{row.label}</span>
                                <span style={{ fontWeight: 600, color: row.green ? '#6ee7b7' : '#e2e8f0' }}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 20, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#f1f5f9' }}>Total</span>
                            <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'monospace', background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                ₹{grandTotal}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                    >
                        <CreditCard size={18} /> Checkout & Pay
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Continue Shopping
                    </button>

                    <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <Tag size={14} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            Payment will be charged to your saved payment method on file.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
