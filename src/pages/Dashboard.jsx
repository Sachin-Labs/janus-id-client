import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Check, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import api from '../services/api';

const Dashboard = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [createdApp, setCreatedApp] = useState(null);
    const [copied, setCopied] = useState(false);

    const [newApp, setNewApp] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const { data } = await api.get('/admin/applications');
            setApps(data.applications);
        } catch {
            console.error("Failed to fetch apps");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/admin/applications', newApp);
            setCreatedApp({
                ...data.application,
                plainSecret: data.plainSecret
            });
            setIsModalOpen(false);
            setIsSuccessModalOpen(true);
            setNewApp({ name: '', description: '' });
            fetchApps();
        } catch {
            alert("Failed to create app");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Applications</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your connected applications</p>
                </div>
                <div style={{ width: 'auto' }}>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <div className="flex-center">
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            Create Application
                        </div>
                    </Button>
                </div>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '1.5rem' }}>
                    {apps.map(app => (
                        <div
                            key={app._id}
                            className="glass-card"
                            style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                            onClick={() => navigate(`/admin/apps/${app._id}`)}
                        >
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '46px', height: '46px', borderRadius: '12px', marginRight: '1rem', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary-hover), var(--primary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#FFFFFF', fontSize: '1.3rem', fontWeight: '700',
                                        boxShadow: '0 4px 12px var(--primary-border)'
                                    }}>
                                        {(app.name || 'A')[0].toUpperCase()}
                                    </div>
                                    <h3 className="truncate" style={{ fontSize: '1.1rem', minWidth: 0 }}>{app.name}</h3>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0' }}>
                                    {app.description}
                                </p>
                            </div>
                        </div>
                    ))}
                    {apps.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                            No applications found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Application">
                <form onSubmit={handleCreateApp}>
                    <Input
                        label="Application Name"
                        placeholder="e.g. CRM Dashboard"
                        value={newApp.name}
                        onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        placeholder="Brief description..."
                        value={newApp.description}
                        onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                        required
                    />
                    <div style={{ marginTop: '1.5rem' }}>
                        <Button type="submit">Create Application</Button>
                    </div>
                </form>
            </Modal>

            {/* Success Modal - SHOW ONCE PATTERN */}
            <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Application Created Successfully">
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ background: 'var(--warning-soft)', border: '1px solid var(--warning-border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                        <AlertCircle style={{ color: 'var(--warning)', flexShrink: 0 }} size={20} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--warning)', margin: 0 }}>
                            <strong>Security Warning:</strong> This is the only time we will show your Client Secret. Please copy it and store it securely. We only store the hashed version in our database.
                        </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Client ID</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {createdApp?.clientId}
                            </div>
                            <button onClick={() => copyToClipboard(createdApp?.clientId)} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-muted)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Client Secret</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 'bold', wordBreak: 'break-all' }}>
                                {createdApp?.plainSecret}
                            </div>
                            <button onClick={() => copyToClipboard(createdApp?.plainSecret)} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-muted)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
                                {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button onClick={() => setIsSuccessModalOpen(false)}>I have saved the secret</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
