import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Zap } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { name: 'Nick Fury', role: 'Admin', country: '🌍 Global', gradient: 'linear-gradient(135deg,#7c3aed,#9333ea)', roleColor: '#c4b5fd' },
    { name: 'Captain Marvel', role: 'Manager', country: '🇮🇳 India', gradient: 'linear-gradient(135deg,#db2777,#e11d48)', roleColor: '#f9a8d4' },
    { name: 'Captain America', role: 'Manager', country: '🇺🇸 USA', gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)', roleColor: '#93c5fd' },
    { name: 'Thanos', role: 'Member', country: '🇮🇳 India', gradient: 'linear-gradient(135deg,#ea580c,#dc2626)', roleColor: '#fdba74' },
    { name: 'Thor', role: 'Member', country: '🇮🇳 India', gradient: 'linear-gradient(135deg,#0891b2,#0284c7)', roleColor: '#67e8f9' },
    { name: 'Travis', role: 'Member', country: '🇺🇸 USA', gradient: 'linear-gradient(135deg,#059669,#10b981)', roleColor: '#6ee7b7' },
];

export default function Login() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const doLogin = async (name: string) => {
        setLoading(true);
        setError('');
        try {
            await login(name);
            navigate('/');
        } catch {
            setError('User not found. Please select a demo account below.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) doLogin(username.trim());
    };

    // Just fill the input — user still clicks Sign In
    const selectAccount = (name: string) => {
        setUsername(name);
        setError('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background blobs */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: -160, left: -160,
                    width: 480, height: 480, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: -160, right: -160,
                    width: 480, height: 480, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite 2s',
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                        style={{
                            width: 72, height: 72, borderRadius: 20,
                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 0 40px rgba(124,58,237,0.4), 0 8px 32px rgba(0,0,0,0.4)',
                            animation: 'float 4s ease-in-out infinite',
                        }}
                    >
                        <Zap size={32} color="white" fill="white" />
                    </motion.div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 8 }}>
                        Slooze{' '}
                        <span style={{ background: 'linear-gradient(135deg,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Foods
                        </span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enterprise food ordering platform</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 24,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    padding: 32,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                    marginBottom: 16,
                }}>
                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block', fontSize: '0.7rem', fontWeight: 700,
                            color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
                        }}>
                            Username
                        </label>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setError(''); }}
                                placeholder="Enter your name..."
                                style={{ paddingLeft: 42 }}
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                        borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                                        fontSize: '0.8rem', color: '#fca5a5',
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || !username.trim()}
                            style={{
                                width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                cursor: loading || !username.trim() ? 'not-allowed' : 'pointer',
                                opacity: loading || !username.trim() ? 0.5 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                                transition: 'all 0.2s',
                                fontFamily: 'inherit',
                            }}
                        >
                            {loading
                                ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                : <><span>Sign In</span><ChevronRight size={18} /></>
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Quick Access
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    {/* Demo accounts grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {DEMO_ACCOUNTS.map((acc) => (
                            <motion.button
                                key={acc.name}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => selectAccount(acc.name)}
                                disabled={loading}
                                style={{
                                    textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: 'none',
                                    background: username === acc.name ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                                    outline: username === acc.name ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: acc.gradient,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 900, color: 'white',
                                    marginBottom: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                }}>
                                    {acc.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: acc.roleColor, marginBottom: 2 }}>
                                    {acc.role}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {acc.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#475569' }}>{acc.country}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#334155' }}>
                    Slooze Enterprise · RBAC · Regional Isolation
                </p>
            </motion.div>
        </div>
    );
}
