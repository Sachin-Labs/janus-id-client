import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Note: api interceptor handles token from localStorage
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, { withCredentials: true });
            setUser(res.data.user);
            setApps(res.data.apps);
            setFirstName(res.data.user.firstName);
            setLastName(res.data.user.lastName || '');
        } catch (err) {
            setError("Failed to load profile. Please login again.");
            // 401 handled by interceptor (logout)
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/me`, { firstName, lastName }, { withCredentials: true });
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.response?.data?.error || "Update failed");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
                currentPassword,
                newPassword
            }, { withCredentials: true });
            setMessage("Password changed successfully!");
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.error || "Password change failed");
        }
    };

    const handleLogout = async () => {
        await logout(); // Context logout
        navigate('/user-login');
    };

    if (loading) return <div className="p-8 text-center text-white">Loading Profile...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0f1115', color: 'white', padding: '2rem' }}>
            {/* Header */}
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>My Account</h1>
                <button
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: '1px solid #374151', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Sign Out
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gap: '2rem' }}>

                {/* Messages */}
                {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px' }}>{message}</div>}
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

                {/* Personal Info Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Personal Information</h2>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <Input label="Email Address" value={user?.email} disabled={true} />
                            <small style={{ color: '#9ca3af' }}>Email cannot be changed.</small>
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <Button type="submit" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>Save Changes</Button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Security</h2>
                    <form onSubmit={handleChangePassword}>
                        <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <Button type="submit" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>Change Password</Button>
                        </div>
                    </form>
                </div>

                {/* Authorized Apps Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Authorized Applications</h2>
                    {apps.length === 0 ? (
                        <p style={{ color: '#9ca3af' }}>No applications have access to your account.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {apps.map((appItem, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{appItem.application?.name || 'Unknown App'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{appItem.application?.description}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Roles</div>
                                        <div style={{ fontSize: '0.9rem' }}>{appItem.roles.map(r => r.name).join(', ') || 'None'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
