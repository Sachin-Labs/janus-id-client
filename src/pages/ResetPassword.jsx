import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post("/auth/reset-password", {
                email,
                otp,
                newPassword
            });
            setMessage('Password Reset Successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Enter the OTP sent to your email and your new password.
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
                    disabled={!!emailParam} // Lock if passed from previous page
                />
                <Input
                    label="OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="123456"
                />
                <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />
                <div style={{ marginTop: '1.5rem' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </div>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/forgot-password" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Resend OTP?</Link>
            </div>
        </>
    );
};

export default ResetPassword;
