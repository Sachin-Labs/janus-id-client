import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const AuthLayout = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, var(--primary-soft), var(--bg-dark) 55%)',
            padding: '1rem',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <ThemeToggle />
            </div>

            {/* Bottom Left Label */}
            <Link to="/" style={{ position: 'absolute', bottom: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-faint)', fontWeight: 500, textDecoration: 'none' }}>
                <img src="/sina-auth.svg" alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', opacity: 0.5, filter: 'grayscale(100%)' }} />
                SINA Auth
            </Link>

            <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
