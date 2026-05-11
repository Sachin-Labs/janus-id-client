import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, LogOut, Grid, Shield, Key } from 'lucide-react'; // Basic icons

// Sidebar Item Component
const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            marginBottom: '0.5rem',
            transition: 'var(--transition)',
            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
        })}
    >
        <Icon size={20} style={{ marginRight: '12px' }} />
        <span style={{ fontWeight: 500 }}>{label}</span>
    </NavLink>
);

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="Janus ID Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', marginRight: '10px', objectFit: 'cover' }} />
                    <h2 style={{ fontSize: '1.25rem' }}>Janus ID</h2>
                </div>

                <nav style={{ flex: 1 }}>
                    <NavItem to="/admin" icon={Grid} label="Applications" />
                    {/* Add more generic items here if needed, but App-specifics will be inside AppDetails */}
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', marginRight: '10px' }}></div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.email || 'Admin'}</div>
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
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
