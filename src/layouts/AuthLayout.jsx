import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1f2937, #0f1115)',
            padding: '1rem',
            position: 'relative'
        }}>
            {/* Bottom Left Label */}
            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                <img src="/logo.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', opacity: 0.5, filter: 'grayscale(100%)' }} />
                Janus ID
            </div>

            <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
