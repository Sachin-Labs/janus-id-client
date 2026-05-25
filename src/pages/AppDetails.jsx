import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Plus, Trash2, Key, Shield, AlertTriangle, Edit, Trash, RefreshCw, Check, AlertCircle, Smartphone, Globe } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../services/api';

const AppDetails = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [app, setApp] = useState(null);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [integrationFlow, setIntegrationFlow] = useState('pkce');

    // Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [isEditPermModalOpen, setIsEditPermModalOpen] = useState(false);
    const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false);
    const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false);
    const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
    const [isRotationSuccessOpen, setIsRotationSuccessOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserRoles, setSelectedUserRoles] = useState([]);
    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [newPerm, setNewPerm] = useState({ name: '', description: '' });
    const [editRole, setEditRole] = useState({ _id: '', name: '', description: '' });
    const [editPerm, setEditPerm] = useState({ _id: '', name: '', description: '' });
    const [editApp, setEditApp] = useState({ name: '', description: '' });
    const [rotatedSecret, setRotatedSecret] = useState('');
    const [copied, setCopied] = useState(false);

    const [selectedMappingRole, setSelectedMappingRole] = useState(null);
    const [redirectUris, setRedirectUris] = useState('');
    const [isFirstParty, setIsFirstParty] = useState(false);
    const [defaultRoleIds, setDefaultRoleIds] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);

    useEffect(() => {
        fetchData();
    }, [appId]);

    useEffect(() => {
        if (selectedMappingRole) {
            fetchRolePermissions(selectedMappingRole._id);
        } else {
            setRolePermissions([]);
        }
    }, [selectedMappingRole]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appRes, rolesRes, permsRes] = await Promise.all([
                api.get(`/admin/applications/${appId}`),
                api.get(`/admin/roles?applicationId=${appId}`),
                api.get(`/admin/permissions?applicationId=${appId}`)
            ]);
            setApp(appRes.data.application);
            setRoles(rolesRes.data.roles);
            setPermissions(permsRes.data.permissions);

            if (appRes.data.application.defaultRoles) {
                setDefaultRoleIds(appRes.data.application.defaultRoles.map(r => r._id));
            }
            if (appRes.data.application.redirectUris) {
                setRedirectUris(appRes.data.application.redirectUris.join(', '));
            }
            setIsFirstParty(appRes.data.application.isFirstParty || false);
        } catch (e) {
            console.error("Failed to fetch app details", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get(`/admin/applications/${appId}/users`);
            setUsers(res.data.users);
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
    }

    const fetchRolePermissions = async (roleId) => {
        try {
            const res = await api.get(`/admin/roles/${roleId}/permissions?applicationId=${appId}`);
            const mappedIds = res.data.permissions.map(rp => rp.permission._id);
            setRolePermissions(mappedIds);
        } catch (e) {
            setRolePermissions([]);
        }
    }

    const fetchUserRoles = async (userId) => {
        try {
            const res = await api.get(`/admin/users/${userId}/roles?appId=${appId}`);
            if (res.data.roles && res.data.roles.length > 0) {
                const userRoleDoc = res.data.roles[0];
                setSelectedUserRoles(userRoleDoc.roles.map(r => r._id));
            } else {
                setSelectedUserRoles([]);
            }
        } catch (e) {
            setSelectedUserRoles([]);
        }
    }

    const handleUpdateSettings = async () => {
        try {
            const uris = redirectUris.split(',').map(u => u.trim()).filter(u => u);
            await api.put(`/admin/applications/${appId}`, {
                defaultRoles: defaultRoleIds,
                redirectUris: uris,
                isFirstParty
            });
            alert("Settings Updated Successfully");
            fetchData();
        } catch (err) {
            alert("Failed to update settings");
        }
    };

    const handleRotateSecret = async () => {
        try {
            const { data } = await api.post(`/admin/applications/${appId}/rotate-secret`);
            setRotatedSecret(data.plainSecret);
            setIsRotateModalOpen(false);
            setIsRotationSuccessOpen(true);
        } catch (e) {
            alert("Failed to rotate secret");
        }
    }

    const manageUserRoles = (user) => {
        setSelectedUser(user);
        setIsUserRoleModalOpen(true);
        fetchUserRoles(user.user._id);
    }

    const handleSaveUserRoles = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users/roles', {
                userId: selectedUser.user._id,
                applicationId: appId,
                roleIds: selectedUserRoles
            });
            setIsUserRoleModalOpen(false);
            alert("User Roles Updated");
            fetchUsers();
        } catch (e) {
            alert("Failed to update user roles");
        }
    }

    const toggleUserRole = (roleId) => {
        setSelectedUserRoles(prev => {
            if (prev.includes(roleId)) return prev.filter(id => id !== roleId);
            return [...prev, roleId];
        });
    }

    const handleCreateRole = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/roles', { ...newRole, application: appId });
            setIsRoleModalOpen(false);
            setNewRole({ name: '', description: '' });
            fetchData();
        } catch (e) { alert("Error"); }
    }

    const handleCreatePerm = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/permissions', { ...newPerm, application: appId });
            setIsPermModalOpen(false);
            setNewPerm({ name: '', description: '' });
            fetchData();
        } catch (e) { alert("Error"); }
    }

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/roles/${editRole._id}`, { ...editRole });
            setIsEditRoleModalOpen(false);
            fetchData();
        } catch (e) { alert("Error"); }
    }

    const handleUpdatePerm = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/permissions/${editPerm._id}`, { ...editPerm });
            setIsEditPermModalOpen(false);
            fetchData();
        } catch (e) { alert("Error"); }
    }

    const handleDeleteRole = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try { await api.delete(`/admin/roles/${id}`); fetchData(); } catch (e) { alert("Delete failed"); }
    }

    const handleDeletePerm = async (id) => {
        if (!window.confirm("Are you sure you want to delete this permission?")) return;
        try { await api.delete(`/admin/permissions/${id}`); fetchData(); } catch (e) { alert("Delete failed"); }
    }

    const handleDeleteApp = async () => {
        if (!window.confirm("DANGER: Are you sure you want to delete this application?")) return;
        try { await api.delete(`/admin/applications/${appId}`); navigate('/admin'); } catch (e) { alert("Delete failed"); }
    }

    const handleUpdateApp = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/applications/${appId}`, editApp);
            setApp({ ...app, ...editApp });
            setIsEditAppModalOpen(false);
            alert("Application updated");
        } catch (e) { alert("Update failed"); }
    }

    const togglePermission = async (roleId, permissionId, isChecked) => {
        try {
            if (isChecked) {
                await api.post(`/admin/roles/${roleId}/permissions/`, { permissionsId: permissionId, applicationId: appId });
                setRolePermissions(prev => [...prev, permissionId]);
            } else {
                await api.delete(`/admin/roles/${roleId}/permissions`, { data: { permissionsId: permissionId, applicationId: appId } });
                setRolePermissions(prev => prev.filter(id => id !== permissionId));
            }
        } catch (e) { alert("Failed to update mapping"); }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading...</div>;
    if (!app) return <div className="flex-center" style={{ height: '50vh' }}>App not found</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ marginRight: '1rem' }}>{app.name}</h1>
                        <span style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>ID: {app.clientId}</span>
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{app.description}</p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '5px' }}>
                    {['info', 'roles', 'permissions', 'mapping', 'users', 'integration', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                border: activeTab === tab ? 'none' : '1px solid var(--border)',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'info' && (
                <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <Button onClick={() => { setEditApp({ name: app.name, description: app.description }); setIsEditAppModalOpen(true); }}>
                            <div className="flex-center"><Edit size={16} style={{ marginRight: '8px' }} /> Edit Details</div>
                        </Button>
                    </div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Credentials</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Client ID</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem' }}>{app.clientId}</code>
                            <button onClick={() => copyToClipboard(app.clientId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><Copy size={18} /></button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Client Secret</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <code style={{ flex: 1, letterSpacing: '4px', opacity: 0.5, fontSize: '1.2rem' }}>••••••••••••••••••••••••••••••••</code>
                            <button onClick={() => setIsRotateModalOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '4px' }}>
                                <RefreshCw size={18} /> Rotate
                            </button>
                        </div>
                        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <Shield size={14} style={{ marginRight: '6px' }} /> Secrets are securely hashed. Use rotation to generate a new one.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '1rem' }}>Registered Users</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {users.map(u => (
                            <div key={u._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{u.user.firstName} {u.user.lastName}</h4>
                                    <p style={{ color: 'var(--text-muted)', margin: '4px 0', fontSize: '0.9rem' }}>{u.user.email}</p>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {u.roles.map(r => (
                                            <span key={r._id} style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>{r.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={() => manageUserRoles(u)} style={{ width: 'auto', padding: '8px 16px' }}>Manage Roles</Button>
                            </div>
                        ))}
                        {users.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found for this application.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Roles</h3>
                        <Button onClick={() => setIsRoleModalOpen(true)} style={{ width: '160px' }}><div className="flex-center"><Plus size={18} style={{ marginRight: '8px' }} /> Add Role</div></Button>
                    </div>
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {roles.map(r => (
                            <div key={r._id} className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <Shield size={20} style={{ color: 'var(--primary)', marginRight: '10px' }} />
                                    <h4 style={{ margin: 0 }}>{r.name}</h4>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{r.description}</p>
                                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => { setEditRole(r); setIsEditRoleModalOpen(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteRole(r._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'permissions' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Permissions</h3>
                        <Button onClick={() => setIsPermModalOpen(true)} style={{ width: '180px' }}><div className="flex-center"><Plus size={18} style={{ marginRight: '8px' }} /> Add Permission</div></Button>
                    </div>
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {permissions.map(p => (
                            <div key={p._id} className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <Key size={20} style={{ color: 'var(--primary)', marginRight: '10px' }} />
                                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{p.description}</p>
                                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => { setEditPerm(p); setIsEditPermModalOpen(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDeletePerm(p._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'mapping' && (
                <div className="glass-card fade-in" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Role-Permission Mapping</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
                        <div style={{ borderRight: '1px solid var(--border)', paddingRight: '1.5rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Select a role to manage its permissions:</p>
                            {roles.map(r => (
                                <div
                                    key={r._id}
                                    onClick={() => setSelectedMappingRole(r)}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius)',
                                        background: selectedMappingRole?._id === r._id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        color: selectedMappingRole?._id === r._id ? 'white' : 'var(--text-muted)',
                                        marginBottom: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {r.name}
                                </div>
                            ))}
                        </div>
                        <div>
                            {selectedMappingRole ? (
                                <div>
                                    <h4 style={{ marginBottom: '1.25rem' }}>Assigning Permissions to "{selectedMappingRole.name}"</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                        {permissions.map(p => (
                                            <label key={p._id} className="flex-center" style={{ justifyContent: 'flex-start', background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius)', cursor: 'pointer', border: '1px solid var(--border)' }}>
                                                <input
                                                    type="checkbox"
                                                    style={{ marginRight: '12px', width: '18px', height: '18px' }}
                                                    checked={rolePermissions.includes(p._id)}
                                                    onChange={e => togglePermission(selectedMappingRole._id, p._id, e.target.checked)}
                                                />
                                                <span style={{ fontSize: '0.95rem' }}>{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-center" style={{ height: '200px', color: 'var(--text-muted)', flexDirection: 'column' }}>
                                    <Shield size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Select a role on the left to start mapping permissions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'integration' && (
                <div className="glass-card fade-in" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Integration Guide</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Follow the Authorization Code Flow to securely authenticate users.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-input)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setIntegrationFlow('pkce')}
                                style={{
                                    background: integrationFlow === 'pkce' ? 'var(--primary)' : 'transparent',
                                    border: 'none',
                                    color: integrationFlow === 'pkce' ? 'white' : 'var(--text-muted)',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Globe size={16} /> Frontend (PKCE)
                            </button>
                            <button
                                onClick={() => setIntegrationFlow('standard')}
                                style={{
                                    background: integrationFlow === 'standard' ? 'var(--primary)' : 'transparent',
                                    border: 'none',
                                    color: integrationFlow === 'standard' ? 'white' : 'var(--text-muted)',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Smartphone size={16} /> Backend (Standard)
                            </button>
                        </div>
                    </div>

                    {integrationFlow === 'pkce' ? (
                        <div className="fade-in">
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', lineHeight: '1.5' }}>
                                    <strong>PKCE Recommended:</strong> Best for SPAs (React, Vue) or Mobile apps. It uses a one-time cryptographic handshake instead of a permanent secret.
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ marginBottom: '0.75rem' }}>1. Authorize (Frontend Redirect)</h4>
                                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid #1e293b' }}>
                                    <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {`https://janusid.vercel.app/authorize?clientId=${app.clientId}&redirectUri=YOUR_CALLBACK&codeChallenge=HASHED_VERIFIER&codeChallengeMethod=S256`}
                                    </code>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '0.75rem' }}>2. Exchange Code for Token</h4>
                                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid #1e293b' }}>
                                    <pre style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        {`// No clientSecret required for PKCE
const res = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/token', {
    code: 'AUTH_CODE_FROM_URL',
    clientId: '${app.clientId}',
    codeVerifier: 'YOUR_ORIGINAL_VERIFIER_WORD'
});`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="fade-in">
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#10b981', lineHeight: '1.5' }}>
                                    <strong>Standard Flow:</strong> Best for servers (Node, Python, Go) where you can securely hide your Client Secret in environment variables.
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ marginBottom: '0.75rem' }}>1. Authorize (Redirect)</h4>
                                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid #1e293b' }}>
                                    <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {`https://janusid.vercel.app/authorize?clientId=${app.clientId}&redirectUri=YOUR_CALLBACK`}
                                    </code>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '0.75rem' }}>2. Exchange (Server-Side)</h4>
                                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid #1e293b' }}>
                                    <pre style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        {`// Requires clientSecret (Keep this on your server!)
const res = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/token', {
    code: 'AUTH_CODE_FROM_URL',
    clientId: '${app.clientId}',
    clientSecret: 'YOUR_SECURE_CLIENT_SECRET'
});`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="glass-card fade-in" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Application Settings</h3>
                    <div style={{ maxWidth: '600px' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <Input
                                label="Allowed Redirect URIs"
                                placeholder="e.g. http://localhost:3000/callback, https://app.com/auth"
                                value={redirectUris}
                                onChange={e => setRedirectUris(e.target.value)}
                            />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>Comma separated list of valid callback URLs.</p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px' }}
                                    checked={isFirstParty}
                                    onChange={e => setIsFirstParty(e.target.checked)}
                                />
                                <div>
                                    <span style={{ fontWeight: 600, display: 'block' }}>First Party Application</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Skips the "Authorize Access" consent screen for users.</span>
                                </div>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <Button onClick={handleUpdateSettings}>Save Settings</Button>
                            <Button onClick={handleDeleteApp} style={{ background: '#ef4444', border: 'none' }}>Delete Application</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals Section */}

            {/* Secret Rotation */}
            <Modal isOpen={isRotateModalOpen} onClose={() => setIsRotateModalOpen(false)} title="Rotate Client Secret">
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '12px' }}>
                        <AlertTriangle style={{ color: '#ef4444', flexShrink: 0 }} size={24} />
                        <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>
                            Rotating the secret will **immediately** invalidate the current one. All apps using the old secret will lose access until updated.
                        </p>
                    </div>
                    <p style={{ marginBottom: '2rem' }}>Are you sure you want to proceed with rotation for <strong>{app.name}</strong>?</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button onClick={() => setIsRotateModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancel</Button>
                        <Button onClick={handleRotateSecret} style={{ background: '#ef4444', border: 'none' }}>Rotate Now</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isRotationSuccessOpen} onClose={() => setIsRotationSuccessOpen(false)} title="New Client Secret">
                <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #eab308', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
                        <AlertCircle style={{ color: '#eab308', flexShrink: 0 }} size={24} />
                        <p style={{ color: '#eab308', margin: 0, fontSize: '0.9rem' }}>
                            **Important:** This secret is only shown once. Copy it and store it securely. We do not store plain-text secrets.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 'bold', wordBreak: 'break-all', fontSize: '1.1rem' }}>{rotatedSecret}</div>
                        <button onClick={() => copyToClipboard(rotatedSecret)} style={{ background: 'var(--bg-input)', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                            {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
                        </button>
                    </div>
                    <Button onClick={() => setIsRotationSuccessOpen(false)}>I have saved my secret</Button>
                </div>
            </Modal>

            {/* Management Modals */}
            <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Create New Role">
                <form onSubmit={handleCreateRole}>
                    <Input label="Name" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} required placeholder="e.g. Editor" />
                    <Input label="Description" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} required placeholder="Can edit posts" />
                    <Button type="submit">Create Role</Button>
                </form>
            </Modal>

            <Modal isOpen={isPermModalOpen} onClose={() => setIsPermModalOpen(false)} title="Create New Permission">
                <form onSubmit={handleCreatePerm}>
                    <Input label="Name" value={newPerm.name} onChange={e => setNewPerm({ ...newPerm, name: e.target.value })} required placeholder="e.g. post:edit" />
                    <Input label="Description" value={newPerm.description} onChange={e => setNewPerm({ ...newPerm, description: e.target.value })} required placeholder="Permission to edit a blog post" />
                    <Button type="submit">Create Permission</Button>
                </form>
            </Modal>

            <Modal isOpen={isUserRoleModalOpen} onClose={() => setIsUserRoleModalOpen(false)} title="Manage User Roles">
                <form onSubmit={handleSaveUserRoles}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Updating roles for <strong>{selectedUser?.user?.email}</strong></p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto', padding: '5px' }}>
                        {roles.map(r => (
                            <label key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', cursor: 'pointer', border: '1px solid var(--border)' }}>
                                <input type="checkbox" checked={selectedUserRoles.includes(r._id)} onChange={() => toggleUserRole(r._id)} style={{ width: '18px', height: '18px' }} />
                                <span style={{ fontSize: '0.9rem' }}>{r.name}</span>
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <Button type="submit">Save User Roles</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditRoleModalOpen} onClose={() => setIsEditRoleModalOpen(false)} title="Edit Role">
                <form onSubmit={handleUpdateRole}>
                    <Input label="Name" value={editRole.name} onChange={e => setEditRole({ ...editRole, name: e.target.value })} required />
                    <Input label="Description" value={editRole.description} onChange={e => setEditRole({ ...editRole, description: e.target.value })} required />
                    <Button type="submit">Update Role</Button>
                </form>
            </Modal>

            <Modal isOpen={isEditPermModalOpen} onClose={() => setIsEditPermModalOpen(false)} title="Edit Permission">
                <form onSubmit={handleUpdatePerm}>
                    <Input label="Name" value={editPerm.name} onChange={e => setEditPerm({ ...editPerm, name: e.target.value })} required />
                    <Input label="Description" value={editPerm.description} onChange={e => setEditPerm({ ...editPerm, description: e.target.value })} required />
                    <Button type="submit">Update Permission</Button>
                </form>
            </Modal>

            <Modal isOpen={isEditAppModalOpen} onClose={() => setIsEditAppModalOpen(false)} title="Edit Application">
                <form onSubmit={handleUpdateApp}>
                    <Input label="Name" value={editApp.name} onChange={e => setEditApp({ ...editApp, name: e.target.value })} required />
                    <Input label="Description" value={editApp.description} onChange={e => setEditApp({ ...editApp, description: e.target.value })} required />
                    <Button type="submit">Update Application</Button>
                </form>
            </Modal>
        </div>
    );
};

export default AppDetails;
