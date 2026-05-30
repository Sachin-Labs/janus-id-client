import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { getOAuthState } from '../services/oauthHelper';

const UserSignup = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const oauthState = getOAuthState() || {};
    const clientId = searchParams.get('clientId') || oauthState.clientId;
    const redirectUri = searchParams.get('redirectUri') || oauthState.redirectUri;
    const queryStr = searchParams.toString() || new URLSearchParams(oauthState).toString();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // We can reuse the same endpoint we use for admin signup or forgot password
            // Let's use the one that requestOtp maps to: /api/auth/otp-request (from auth.js)
            await api.post("/auth/otp-request", { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const nameParts = username.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        try {
            await api.post("/auth/register", {
                firstName,
                lastName: lastName || undefined,
                email,
                password,
                clientId,
                otp
            });

            navigate(`/user-login?${queryStr}`);
        } catch (err) {
            setError(err.response?.data || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    if (!clientId || !redirectUri) {
        return (
            <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
                <h2 style={{ color: '#ef4444' }}>Invalid Request</h2>
                <p style={{ color: 'var(--text-muted)' }}>Missing Client ID or Redirect URI.</p>
            </div>
        )
    }

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Create Account</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    {step === 1 ? 'Enter your details' : 'Verify your email'}
                </p>
            </div>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                    <Input
                        label="Full Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="John Doe"
                    />
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

                    <div style={{ marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Verify Email'}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSignup}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        We sent a code to <strong>{email}</strong>. <br />
                        <span onClick={() => setStep(1)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Change email?</span>
                    </div>

                    <Input
                        label="Enter OTP"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        placeholder="123456"
                    />

                    <div style={{ marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Confirm & Sign Up'}
                        </Button>
                    </div>
                </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Already have an account? <Link to={`/user-login?${queryStr}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
            </div>
        </>
    );
};

export default UserSignup;
