import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Globe, CreditCard, Check, AlertTriangle } from 'lucide-react';

const ROLE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
    ADMIN: { bg: 'linear-gradient(135deg, #7c3aed, #9333ea)', text: '#c4b5fd', label: 'Admin' },
    MANAGER: { bg: 'linear-gradient(135deg, #0891b2, #06b6d4)', text: '#67e8f9', label: 'Manager' },
    MEMBER: { bg: 'linear-gradient(135deg, #334155, #475569)', text: '#94a3b8', label: 'Member' },
};

function UserCard({ u, onUpdate }: { u: User; onUpdate: (id: number, val: string) => Promise<void> }) {
    const [payment, setPayment] = useState(u.payment ?? '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const rs = ROLE_STYLE[u.role];

    const handleSave = async () => {
        if (payment === u.payment) return;
        setSaving(true);
        try {
            await onUpdate(u.id, payment);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass glass-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: rs.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.1rem', color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                    {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 4 }}>{u.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                            background: 'rgba(255,255,255,0.08)', color: rs.text,
                        }}>
                            {rs.label}
                        </span>
                        <span style={{
                            padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.05)', color: '#64748b',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <Globe size={10} /> {u.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 USA'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Field */}
            <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CreditCard size={12} /> Payment Method
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        value={payment}
                        onChange={e => setPayment(e.target.value)}
                        placeholder="e.g. Credit Card, UPI..."
                        style={{ flex: 1, fontSize: '0.85rem', padding: '9px 12px' }}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                    />
                    <button
                        onClick={handleSave}
                        disabled={saving || payment === u.payment}
                        style={{
                            padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: saved
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : 'linear-gradient(135deg, #7c3aed, #9333ea)',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem',
                            opacity: (saving || payment === u.payment) ? 0.5 : 1,
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                            flexShrink: 0,
                        }}
                    >
                        {saved ? <><Check size={14} /> Saved</> : saving ? '...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/users')
            .then(r => setUsers(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const updatePayment = async (id: number, payment: string) => {
        await api.patch(`/users/${id}/payment`, { payment });
        setUsers(prev => prev.map(u => u.id === id ? { ...u, payment } : u));
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500, gap: 16 }}>
                <AlertTriangle size={48} style={{ color: '#ef4444' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Access Denied</h2>
                <p style={{ color: '#64748b' }}>Admin clearance required.</p>
            </div>
        );
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div className="spinner" />
        </div>
    );

    const admins = users.filter(u => u.role === 'ADMIN');
    const managers = users.filter(u => u.role === 'MANAGER');
    const members = users.filter(u => u.role === 'MEMBER');

    return (
        <div className="container page-wrapper">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Shield size={20} color="white" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Admin Panel</h1>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Manage team members and payment methods across your organization.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    {[
                        { label: 'Total Users', value: users.length, color: '#a78bfa' },
                        { label: 'Managers', value: managers.length, color: '#67e8f9' },
                        { label: 'Members', value: members.length, color: '#94a3b8' },
                    ].map(stat => (
                        <div key={stat.label} className="glass" style={{ padding: '12px 20px', textAlign: 'center', minWidth: 90 }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: stat.color, fontFamily: 'monospace' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sections */}
            {[
                { title: 'Administrators', users: admins },
                { title: 'Managers', users: managers },
                { title: 'Team Members', users: members },
            ].map(section => section.users.length > 0 && (
                <div key={section.title} style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                        {section.title} · {section.users.length}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {section.users.map((u, idx) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                            >
                                <UserCard u={u} onUpdate={updatePayment} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
