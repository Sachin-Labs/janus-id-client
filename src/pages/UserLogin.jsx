import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { getOAuthState } from '../services/oauthHelper';

const UserLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const oauthState = getOAuthState() || {};
    const clientId = searchParams.get('clientId') || oauthState.clientId;
    const redirectUri = searchParams.get('redirectUri') || oauthState.redirectUri;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post("/auth/login", {
                email,
                password,
                clientId: clientId || 'direct-login'
            });

            if (data.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
            }

            if (clientId && redirectUri) {
                const queryStr = searchParams.toString() || new URLSearchParams(oauthState).toString();
                navigate(`/authorize?${queryStr}`);
            } else {
                navigate('/profile');
            }
        } catch (err) {
            setError(err.response?.data || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if ((!clientId || !redirectUri) && !window.location.pathname.includes('login')) {
        // Allow rendering if just /user-login (for profile access)
    }

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Sign In</h2>
                <p style={{ color: 'var(--text-muted)' }}>Resume your session</p>
            </div>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleLogin}>
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                />
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <Link to={`/forgot-password?${searchParams.toString()}`} style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Don't have an account? <Link to={`/user-register?${searchParams.toString()}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign Up</Link>
            </div>
        </>
    );
};

export default UserLogin;
