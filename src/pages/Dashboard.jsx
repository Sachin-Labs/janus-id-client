import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import api from '../services/api'; // We'll need to add app-related API calls here or new service

const Dashboard = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newApp, setNewApp] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchApps();
    }, []);

    // API Call Placeholder - We need to implement this in backend or use what we have
    // Wait, backend doesn't have "get all apps" for user? 
    // AdminController has `createApplication`. We likely need `getApplications`.
    // Let's assume we fetch generic or we need to add that endpoint.
    // For now, I'll mock it or try to fetch.
    // Checking adminController... it DOES NOT have getApplications. It only has create.
    // I need to add that to backend!

    const fetchApps = async () => {
        // Temporary mock until backend implementation
        // setApps([{_id: '1', name: 'Test App', description: 'Demo App'}]);
        // setLoading(false);

        // Real implementation attempt:
        try {
            // We need to implement this endpoint in backend first!
            const { data } = await api.get('/admin/applications');
            setApps(data.applications);
        } catch (e) {
            console.error("Failed to fetch apps", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/applications', newApp);
            setIsModalOpen(false);
            setNewApp({ name: '', description: '' });
            fetchApps(); // Refresh list
        } catch (error) {
            alert("Failed to create app");
        }
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {apps.map(app => (
                        <div
                            key={app._id}
                            className="glass-card"
                            style={{ pading: '1.5rem', cursor: 'pointer', transition: 'var(--transition)' }}
                            onClick={() => navigate(`/admin/apps/${app._id}`)}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(48, 54, 61, 0.5)'}
                        >
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', marginRight: '1rem', color: 'var(--primary)' }}>
                                        <Server size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem' }}>{app.name}</h3>
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
        </div>
    );
};

export default Dashboard;
