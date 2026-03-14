import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, ShieldCheck, UtensilsCrossed, ClipboardList, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_BADGE: Record<string, string> = {
    ADMIN: 'badge badge-violet',
    MANAGER: 'badge badge-cyan',
    MEMBER: 'badge badge-slate',
};

export default function Header() {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(5,8,17,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                    }}>
                        <Zap size={18} color="white" fill="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: '#f1f5f9' }}>
                        Slooze <span className="text-gradient">Foods</span>
                    </span>
                </Link>

                {user && (
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <NavLink to="/" active={isActive('/')} icon={<UtensilsCrossed size={16} />} label="Menu" />
                        <NavLink to="/orders" active={isActive('/orders')} icon={<ClipboardList size={16} />} label="Orders" />
                        <NavLink to="/shared-carts" active={isActive('/shared-carts')} icon={<Users size={16} />} label="Shared" />
                        {user.role === 'ADMIN' && (
                            <NavLink to="/admin" active={isActive('/admin')} icon={<ShieldCheck size={16} />} label="Admin" />
                        )}
                    </nav>
                )}

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* User chip */}
                        <div className="hide-mobile" style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '6px 12px 6px 8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 99,
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 800, color: 'white',
                            }}>
                                {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>{user.name}</div>
                                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                                    <span className={ROLE_BADGE[user.role]}>{user.role}</span>
                                    <span className="badge badge-slate">{user.country === 'INDIA' ? '🇮🇳' : '🇺🇸'} {user.country}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cart */}
                        <Link to="/cart" style={{ position: 'relative', color: '#94a3b8', textDecoration: 'none', padding: 8, borderRadius: 8, display: 'flex', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#06b6d4')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                        >
                            <ShoppingCart size={22} />
                            {items.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    style={{
                                        position: 'absolute', top: 2, right: 2,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
                                        color: 'white', fontSize: 10, fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid #050811',
                                    }}
                                >
                                    {items.length}
                                </motion.span>
                            )}
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#475569', padding: 8, borderRadius: 8,
                                display: 'flex', transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                )}
            </div>
        </header>
    );
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 600,
                textDecoration: 'none',
                color: active ? '#f1f5f9' : '#64748b',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#64748b'; }}
        >
            {icon} {label}
        </Link>
    );
}
