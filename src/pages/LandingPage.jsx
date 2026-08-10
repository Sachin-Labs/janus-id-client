import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Users, RefreshCw, Fingerprint, Lock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const features = [
    {
        icon: KeyRound,
        color: 'var(--primary)',
        title: 'OAuth 2.0 + PKCE',
        desc: 'Authorization Code flow with Proof Key for Code Exchange — the safest way for SPAs, mobile apps, and servers to authenticate.',
    },
    {
        icon: Fingerprint,
        color: 'var(--success)',
        title: 'Hosted SSO Login',
        desc: 'A unified, hosted login page for all your first-party applications. Users sign in once, everywhere.',
    },
    {
        icon: ShieldCheck,
        color: 'var(--info)',
        title: 'Application Registry',
        desc: 'Register your apps, generate client IDs, and manage redirect URIs from a single admin console.',
    },
    {
        icon: RefreshCw,
        color: 'var(--warning)',
        title: 'Secret Rotation',
        desc: 'Show-once client secrets with bcrypt hardening. Invalidate and rotate credentials with one click.',
    },
    {
        icon: Users,
        color: 'var(--danger)',
        title: 'Granular RBAC',
        desc: 'Map roles and permissions to applications and users with an intuitive, granular control interface.',
    },
    {
        icon: Lock,
        color: 'var(--primary)',
        title: 'User Self-Service',
        desc: 'Users manage their profile, reset passwords, and review active sessions — without admin help.',
    },
];

const steps = [
    {
        num: '01',
        title: 'Register your application',
        desc: 'Create an app in the admin console, set your redirect URI, and get a client ID.',
    },
    {
        num: '02',
        title: 'Redirect to SINA Auth',
        desc: 'Send users to /authorize with a PKCE challenge. We handle the hosted login and consent.',
    },
    {
        num: '03',
        title: 'Exchange code for token',
        desc: 'Your app swaps the authorization code for access tokens and securely signs users in.',
    },
];

const LandingPage = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav className="navbar" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid var(--border)', position: 'sticky', top: 0,
                background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/sina-auth.svg" alt="SINA Auth Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0 }} />
                    <div className="navbar-brand" style={{ fontWeight: '700', letterSpacing: '-0.02em' }}>
                        SINA <span style={{ color: 'var(--primary)' }}>Auth</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    <Link to="/login" className="navbar-cta" style={{
                        borderRadius: '8px', fontWeight: '600',
                        background: 'var(--primary-btn-bg)', color: 'var(--primary-contrast)', textDecoration: 'none',
                        border: '1px solid var(--primary-border)'
                    }}>
                        Admin Console
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-pad" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: '700px', height: '400px', background: 'radial-gradient(ellipse, var(--primary-soft), transparent 60%)',
                    pointerEvents: 'none'
                }} />
                <span style={{
                    padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--primary-border)',
                    background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.8rem',
                    fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.75rem'
                }}>
                    OAuth 2.0 Identity &amp; Access Management
                </span>
                <h1 style={{ fontSize: 'clamp(2.1rem, 6.5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.15', letterSpacing: '-0.03em', maxWidth: '800px' }}>
                    One identity for{' '}
                    <span style={{ color: 'var(--primary)' }}>all your applications</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '620px', marginBottom: '2.5rem', lineHeight: '1.7' }}>
                    SINA Auth is a self-hosted identity provider. Add secure sign-in to any app with
                    hosted SSO login, PKCE-protected OAuth 2.0 flows, and granular access control —
                    no auth boilerplate required.
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/signup" style={{
                        padding: '0.9rem 2rem', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '700',
                        background: 'var(--primary-btn-bg)', color: 'var(--primary-contrast)', textDecoration: 'none', border: '1px solid var(--primary-border)'
                    }}>
                        Get Started
                    </Link>
                    <Link to="/login" style={{
                        padding: '0.9rem 2rem', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '600',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-main)', textDecoration: 'none'
                    }}>
                        Open Admin Dashboard
                    </Link>
                </div>
            </main>

            {/* What is SINA Auth */}
            <section style={{ padding: 'clamp(3rem, 8vw, 4.5rem) 2rem', background: 'var(--bg-card)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        What is SINA Auth?
                    </p>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                        A complete identity engine behind every login
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                        SINA Auth centralizes authentication so every application you build uses the same secure,
                        standards-compliant login. Instead of writing auth logic into each app, you register it here,
                        redirect users to our hosted login, and let us handle credentials, sessions, and consent.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                        It powers first-party apps through the OAuth 2.0 Authorization Code flow with PKCE —
                        meaning tokens stay out of your frontend bundle and every integration is protected against
                        authorization-code interception.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: 'clamp(3rem, 8vw, 4.5rem) 2rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.25rem)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                            Everything you need to ship secure auth
                        </h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
                            Purpose-built for developers who want enterprise-grade identity without the enterprise complexity.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1.5rem'
                    }}>
                        {features.map(feature => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} style={{
                                    padding: '1.75rem', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: '16px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
                                        background: 'var(--primary-soft)', border: '1px solid var(--primary-border)'
                                    }}>
                                        <Icon size={22} color={feature.color} />
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.5rem' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: 'clamp(3rem, 8vw, 4.5rem) 2rem', background: 'var(--bg-card)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.25rem)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                            How integration works
                        </h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '1.05rem' }}>
                            Standard OAuth 2.0 Authorization Code flow — integrate any app in minutes.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.5rem'
                    }}>
                        {steps.map(({ num, title, desc }) => (
                            <div key={num} style={{
                                padding: '1.75rem', background: 'var(--bg-card)',
                                border: '1px solid var(--border)', borderRadius: '16px', position: 'relative'
                            }}>
                                <div style={{
                                    fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--primary)',
                                    marginBottom: '1rem'
                                }}>
                                    {num}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: 'clamp(3rem, 8vw, 4.5rem) 2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.25rem)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                    Ready to centralize your logins?
                </h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
                    Sign in to the admin console and register your first application in under a minute.
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/login" style={{
                        padding: '0.9rem 2rem', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '700',
                        background: 'var(--primary-btn-bg)', color: 'var(--primary-contrast)', textDecoration: 'none', border: '1px solid var(--primary-border)'
                    }}>
                        Open Admin Console
                    </Link>
                    <Link to="/signup" style={{
                        padding: '0.9rem 2rem', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '600',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-main)', textDecoration: 'none'
                    }}>
                        Create Admin Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <img src="/sina-auth.svg" alt="" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>SINA Auth</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin Console</Link>
                    <Link to="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Create Account</Link>
                    <Link to="/user-login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>My Profile</Link>
                </div>
                &copy; 2026 SINA Auth. Secure by design.
            </footer>
        </div>
    );
};

export default LandingPage;
