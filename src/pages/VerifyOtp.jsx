import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // 1. Verify OTP
            await api.post('/auth/otp-verify', { email, otp });

            // 2. If we have registration data, complete registration
            const formData = location.state?.formData;
            if (formData) {
                setMessage("OTP Verified! Creating Account...");
                await api.post('/auth/admin-register', formData);
                setMessage("Account Created! Redirecting to login...");
            } else {
                setMessage("Verification Successful! Redirecting...");
            }

            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await api.post('/auth/otp-request', { email });
            setMessage("OTP Resent!");
        } catch (e) {
            setError(e.response?.data || "Failed to resend");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Verify Email</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Enter the OTP sent to {email}
            </p>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
            {message && <div style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{message}</div>}

            <Input
                label="Confirm Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <Input
                label="OTP Code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
            />

            <Button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div style={{ marginTop: '1rem' }}>
                <Button variant="secondary" onClick={handleResend} disabled={loading}>Resend OTP</Button>
            </div>
        </form>
    );
};

export default VerifyOtp;
