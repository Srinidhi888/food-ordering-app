import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Package, Clock, XCircle, CheckCircle2, MapPin, X } from 'lucide-react';

const STATUS_CONFIG = {
    PLACED: { label: 'Placed', badgeClass: 'badge badge-emerald', icon: <CheckCircle2 size={11} /> },
    CREATED: { label: 'Pending', badgeClass: 'badge badge-amber', icon: <Clock size={11} /> },
    CANCELLED: { label: 'Cancelled', badgeClass: 'badge badge-red', icon: <XCircle size={11} /> },
};

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Cancel this order?')) return;
        try {
            await api.patch(`/orders/${id}/cancel`);
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div className="spinner" />
        </div>
    );

    return (
        <div className="container page-wrapper">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Order History</h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {orders.length} order{orders.length !== 1 ? 's' : ''} · {user?.country === 'INDIA' ? '🇮🇳 India' : user?.country === 'AMERICA' ? '🇺🇸 USA' : '🌍 All regions'}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="glass" style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <Package size={56} style={{ margin: '0 auto 20px', color: '#334155' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>No orders yet</p>
                    <p style={{ color: '#334155', fontSize: '0.875rem' }}>Your order history will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map((order, idx) => {
                        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.CREATED;
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass"
                                style={{ padding: '20px 24px' }}
                            >
                                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                    {/* Left: ID + Status */}
                                    <div style={{ minWidth: 120 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                                            Order ID
                                        </div>
                                        <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: 10 }}>
                                            #{String(order.id).padStart(4, '0')}
                                        </div>
                                        <span className={cfg.badgeClass} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                            <MapPin size={11} style={{ color: '#475569' }} />
                                            <span style={{ fontSize: '0.75rem', color: '#475569' }}>{order.country}</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />

                                    {/* Middle: Items */}
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                            Items
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {order.items?.map(item => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                    <span style={{ color: '#cbd5e1' }}>
                                                        <span style={{ color: '#a78bfa', fontWeight: 700 }}>{item.quantity}×</span> {item.menuItem?.name ?? 'Item'}
                                                    </span>
                                                    {item.menuItem?.price && (
                                                        <span style={{ color: '#64748b', fontFamily: 'monospace' }}>₹{item.menuItem.price * item.quantity}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />

                                    {/* Right: Total + Actions */}
                                    <div style={{ minWidth: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                                                Total
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace', color: '#f1f5f9' }}>
                                                ₹{order.totalAmount}
                                            </div>
                                        </div>
                                        {canCancel && order.status === 'PLACED' && (
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                className="btn btn-danger btn-sm"
                                                style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar for placed orders */}
                                {order.status === 'PLACED' && (
                                    <div style={{ marginTop: 16, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '70%' }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: 99, boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
