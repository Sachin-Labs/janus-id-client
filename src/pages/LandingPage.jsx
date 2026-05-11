import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const LandingPage = () => {
    return (
        <div style={{ minHeight: '100vh', background: '#0f1115', color: 'white', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo.png" alt="Janus ID Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Janus ID
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login">
                        <Button style={{ background: 'transparent', border: '1px solid #374151', width: 'auto', padding: '0.5rem 1.5rem' }}>Admin Console</Button>
                    </Link>
                    <Link to="/user-login">
                        <Button style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>My Profile</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                    Secure Identity for <br />
                    <span style={{ color: '#6366f1' }}>Modern Applications</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '600px', marginBottom: '3rem' }}>
                    A complete Identity Access Management system. Manage users, applications, and permissions with ease.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/user-register">
                        <Button style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Get Started</Button>
                    </Link>
                    <Link to="/login">
                        <Button style={{ background: '#1f2937', padding: '1rem 2rem', fontSize: '1.1rem' }}>Admin Dashboard</Button>
                    </Link>
                </div>
            </main>

            {/* Features (Simple Grid) */}
            <section style={{ padding: '4rem 2rem', background: '#111827' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#818cf8' }}>Admin Dashboard</h3>
                        <p style={{ color: '#9ca3af' }}>Centralized control for managing applications, roles, and user permissions.</p>
                    </div>
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#a78bfa' }}>Single Sign-On</h3>
                        <p style={{ color: '#9ca3af' }}>Secure OAuth 2.0 flow allowing users to log in to multiple apps with one identity.</p>
                    </div>
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#34d399' }}>Self-Service</h3>
                        <p style={{ color: '#9ca3af' }}>Users can manage their profiles, reset passwords, and view active sessions.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem', textAlign: 'center', color: '#4b5563', borderTop: '1px solid #1f2937' }}>
                &copy; 2024 Janus ID. Secure by Design.
            </footer>
        </div>
    );
};

export default LandingPage;
