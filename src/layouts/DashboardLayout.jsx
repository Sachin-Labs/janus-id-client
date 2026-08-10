import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, AppWindow, Shield, Key } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

// Sidebar Item Component
const NavItem = ({ to, icon, label, onClick }) => {
    const Icon = icon;
    return (
        <NavLink
            to={to}
            onClick={onClick}
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                marginBottom: '0.5rem',
                transition: 'var(--transition)',
            })}
        >
            <Icon size={20} style={{ marginRight: '12px' }} />
            <span style={{ fontWeight: 500 }}>{label}</span>
        </NavLink>
    );
};

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        closeMenu();
        logout();
        navigate('/login');
    }

    return (
        <div className="app-shell">
            {!menuOpen && (
                <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                    <Menu size={22} />
                </button>
            )}

            {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

            {/* Sidebar */}
            <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center' }}>
                    <img src="/sina-auth.svg" alt="SINA Auth Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', marginRight: '10px', objectFit: 'cover' }} />
                    <h2 style={{ fontSize: '1.25rem', flex: 1 }}>SINA Auth</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ThemeToggle />
                        <button className="sidebar-close" onClick={closeMenu} aria-label="Close menu">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    <NavItem to="/admin" icon={AppWindow} label="Applications" onClick={closeMenu} />
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>{(user?.name || user?.email || 'A')[0].toUpperCase()}</div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div className="truncate" style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name || user?.email || 'Admin'}</div>
                            {user?.email && <div className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', width: '100%',
                            padding: '10px', background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={16} style={{ marginRight: '10px' }} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
