import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '', // Backend expects 'email' now, not 'emailId'
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.type === 'email' ? 'email' : e.target.type === 'password' ? 'password' : e.target.placeholder.includes('First') ? 'firstName' : 'lastName']: e.target.value });
        // Simplify logic for demo, better to use name attribute
    };

    const handleInputChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // 1. Request OTP
            await api.post('/auth/otp-request', { email: formData.email });

            // 2. Navigate to Verify OTP with form data
            navigate('/verify-otp', { state: { email: formData.email, formData } });
        } catch (err) {
            setError(err.response?.data || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Input placeholder="First Name" value={formData.firstName} onChange={handleInputChange('firstName')} required />
                <Input placeholder="Last Name" value={formData.lastName} onChange={handleInputChange('lastName')} />
            </div>

            <Input
                label="Email Address"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
            />
            <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
            />

            <Button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
            </div>
        </form>
    );
};

export default Signup;
