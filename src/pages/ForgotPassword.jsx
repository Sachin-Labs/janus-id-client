import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post("/auth/forgot-password", { email });
            setMessage(`OTP sent to ${email} (if registered).`);
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}&${searchParams.toString()}`);
            }, 1000);
        } catch (err) {
            setError(err.response?.data || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    // If query params exist (clientId), it's a user flow.
    const isUserFlow = searchParams.get('clientId') || searchParams.get('type') === 'user';
    const backLink = isUserFlow
        ? `/user-login?${searchParams.toString()}`
        : '/login';

    return (
        <>
            <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Forgot Password</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Enter your email to receive a password reset OTP.
            </p>

            {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />
                <div style={{ marginTop: '1.5rem' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                </div>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to={backLink} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Back to {isUserFlow ? 'User' : 'Admin'} Login
                </Link>
            </div>
        </>
    );
};

export default ForgotPassword;
