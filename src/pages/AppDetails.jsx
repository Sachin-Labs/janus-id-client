import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Plus, Trash2, Key, Shield, AlertTriangle, Edit, Trash } from 'lucide-react';
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
    const [users, setUsers] = useState([]); // [NEW] users list
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false); // [NEW]
    const [isEditPermModalOpen, setIsEditPermModalOpen] = useState(false); // [NEW]
    const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserRoles, setSelectedUserRoles] = useState([]);

    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [newPerm, setNewPerm] = useState({ name: '', description: '' });
    const [editRole, setEditRole] = useState({ _id: '', name: '', description: '' }); // [NEW]
    const [editPerm, setEditPerm] = useState({ _id: '', name: '', description: '' }); // [NEW]
    const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false); // [NEW]
    const [editApp, setEditApp] = useState({ name: '', description: '' }); // [NEW]

    const [selectedMappingRole, setSelectedMappingRole] = useState(null);
    // const [integrationType, setIntegrationType] = useState('vanilla'); // REMOVED
    const [redirectUris, setRedirectUris] = useState(''); // [NEW]
    const [isFirstParty, setIsFirstParty] = useState(false); // [NEW]

    // Settings State
    const [defaultRoleIds, setDefaultRoleIds] = useState([]); // [NEW]

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

            // Initialize default roles and redirect URIs
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
            // Backend returns populated rolePermission objects. We need the permission IDs.
            // Handling the specific backend response structure
            const mappedIds = res.data.permissions.map(rp => rp.permission._id);
            setRolePermissions(mappedIds);
        } catch (e) {
            // Backend returns 500 if no permissions found (legacy behavior), treat as empty
            if (e.response && (e.response.status === 500 || e.response.status === 404)) {
                setRolePermissions([]);
            } else {
                console.error("Failed to fetch role permissions", e);
            }
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
            alert(err.response?.data?.error || "Failed to update settings");
        }
    };

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
        } catch (e) {
            alert("Failed to create role");
        }
    }

    const handleCreatePerm = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/permissions', { ...newPerm, application: appId });
            setIsPermModalOpen(false);
            setNewPerm({ name: '', description: '' });
            fetchData();
        } catch (e) {
            alert("Failed to create permission");
        }
    }

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/roles/${editRole._id}`, { ...editRole });
            setIsEditRoleModalOpen(false);
            fetchData();
        } catch (e) {
            alert("Failed to update role");
        }
    }

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm("Are you sure? This will remove this role from all users.")) return;
        try {
            await api.delete(`/admin/roles/${roleId}`);
            fetchData();
        } catch (e) {
            alert("Failed to delete role");
        }
    }

    const handleUpdatePerm = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/permissions/${editPerm._id}`, { ...editPerm });
            setIsEditPermModalOpen(false);
            fetchData();
        } catch (e) {
            alert("Failed to update permission");
        }
    }

    const handleDeletePerm = async (permId) => {
        if (!window.confirm("Are you sure? This will remove this permission from all roles.")) return;
        try {
            await api.delete(`/admin/permissions/${permId}`);
            fetchData();
        } catch (e) {
            alert("Failed to delete permission");
        }
    }

    const handleDeleteApp = async () => {
        if (!window.confirm("DANGER: Are you sure you want to delete this application? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/applications/${appId}`);
            navigate('/admin');
        } catch (e) {
            alert("Failed to delete application");
        }
    }

    const handleUpdateApp = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/applications/${appId}`, editApp);
            setApp({ ...app, ...editApp });
            setIsEditAppModalOpen(false);
            alert("App updated successfully");
        } catch (e) {
            alert("Failed to update application");
        }
    }

    const togglePermission = async (roleId, permissionId, isChecked) => {
        try {
            if (isChecked) {
                await api.post(`/admin/roles/${roleId}/permissions/`, {
                    permissionsId: permissionId,
                    applicationId: appId
                });
                setRolePermissions(prev => [...prev, permissionId]);
            } else {
                await api.delete(`/admin/roles/${roleId}/permissions`, {
                    data: {
                        permissionsId: permissionId,
                        applicationId: appId
                    }
                });
                setRolePermissions(prev => prev.filter(id => id !== permissionId));
            }
        } catch (e) {
            alert("Failed to update mapping");
            console.error(e);
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied!");
    }

    if (loading) return <div>Loading...</div>;
    if (!app) return <div>App not found</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1 style={{ marginRight: '1rem' }}>{app.name}</h1>
                    <span style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                        ID: {appId}
                    </span>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>{app.description}</p>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', overflowX: 'auto' }}>
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
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {activeTab === 'info' && (
                <div className="glass-card" style={{ padding: '20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        <Button onClick={() => { setEditApp({ name: app.name, description: app.description }); setIsEditAppModalOpen(true); }}>
                            <div className="flex-center"><Edit size={16} style={{ marginRight: '5px' }} /> Edit Details</div>
                        </Button>
                    </div>
                    <h3>Credentials</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Client ID</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <code style={{ flex: 1 }}>{app.clientId}</code>
                            <button onClick={() => copyToClipboard(app.clientId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Copy size={16} /></button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Client Secret</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <code style={{ flex: 1 }}>{app.clientSecret}</code>
                            <button onClick={() => copyToClipboard(app.clientSecret)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Copy size={16} /></button>
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                            <AlertTriangle size={14} style={{ marginRight: '5px' }} /> Keep your client secret private!
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'users' && (
                <div>
                    <h3>Users</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        {users.map(u => (
                            <div key={u._id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ fontSize: '1.1rem' }}>{u.user.firstName} {u.user.lastName}</strong>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.user.email}</div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        {u.roles.map(r => (
                                            <span key={r._id} style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                                                {r.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={() => manageUserRoles(u)} style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto', width: 'fit-content' }}>Manage Roles</Button>
                            </div>
                        ))}
                        {users.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No users found for this app.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Roles</h3>
                        <div style={{ width: '150px' }}>
                            <Button onClick={() => setIsRoleModalOpen(true)}><div className="flex-center"><Plus size={16} /> Add Role</div></Button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                        {roles.map(role => (
                            <div key={role._id} className="glass-card" style={{ padding: '1rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <Shield size={18} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                                    <strong>{role.name}</strong>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{role.description}</p>
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                    <button onClick={() => { setEditRole(role); setIsEditRoleModalOpen(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteRole(role._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'permissions' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Permissions</h3>
                        <div style={{ width: '180px' }}>
                            <Button onClick={() => setIsPermModalOpen(true)}><div className="flex-center"><Plus size={16} /> Add Permission</div></Button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                        {permissions.map(perm => (
                            <div key={perm._id} className="glass-card" style={{ padding: '1rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <Key size={18} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                                    <strong>{perm.name}</strong>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{perm.description}</p>
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                    <button onClick={() => { setEditPerm(perm); setIsEditPermModalOpen(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDeletePerm(perm._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'mapping' && (
                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3>Role-Permission Mapping</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                        <div style={{ borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Select Role</h4>
                            {roles.map(role => (
                                <div
                                    key={role._id}
                                    onClick={() => setSelectedMappingRole(role)}
                                    style={{
                                        padding: '10px',
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius)',
                                        background: selectedMappingRole?._id === role._id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        color: selectedMappingRole?._id === role._id ? 'white' : 'var(--text-muted)',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {role.name}
                                </div>
                            ))}
                        </div>
                        <div>
                            {selectedMappingRole ? (
                                <div>
                                    <h4 style={{ marginBottom: '1rem' }}>Assign Permissions to "{selectedMappingRole.name}"</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {permissions.map(perm => (
                                            <label key={perm._id} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    style={{ marginRight: '10px', width: '16px', height: '16px', cursor: 'pointer' }}
                                                    checked={rolePermissions.includes(perm._id)}
                                                    onChange={(e) => togglePermission(selectedMappingRole._id, perm._id, e.target.checked)}
                                                />
                                                {perm.name}
                                            </label>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Uncheck to remove permission.</p>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                                    Select a role to manage permissions
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Create New Role">
                <form onSubmit={handleCreateRole}>
                    <Input label="Name" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} required placeholder="e.g. Admin" />
                    <Input label="Description" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} required />
                    <Button type="submit">Create Role</Button>
                </form>
            </Modal>

            <Modal isOpen={isPermModalOpen} onClose={() => setIsPermModalOpen(false)} title="Create New Permission">
                <form onSubmit={handleCreatePerm}>
                    <Input label="Name" value={newPerm.name} onChange={e => setNewPerm({ ...newPerm, name: e.target.value })} required placeholder="e.g. read:users" />
                    <Input label="Description" value={newPerm.description} onChange={e => setNewPerm({ ...newPerm, description: e.target.value })} required />
                    <Button type="submit">Create Permission</Button>
                </form>
            </Modal>



            {
                activeTab === 'integration' && (
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3>Integration: Hosted Login (SSO)</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Use the <strong>Authorization Code Flow</strong> to securely log in users.
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>1. Redirect User to IAM</h4>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 'var(--radius)', overflowX: 'auto' }}>
                                <code style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
                                    http://localhost:5173/authorize?clientId={app.clientId}&redirectUri=YOUR_CALLBACK_URL
                                </code>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Make sure <code>YOUR_CALLBACK_URL</code> is whitelisted in the Settings tab.
                            </p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>2. Exchange Code for Token (Backend)</h4>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 'var(--radius)', overflowX: 'auto' }}>
                                <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    {`// NodeJS Example (Express)
const response = await axios.post('http://localhost:8001/oauth/token', {
    code: "CODE_FROM_URL_QUERY",
    clientId: "${app.clientId}",
    clientSecret: "${app.clientSecret}"
});

const { accessToken, refreshToken } = response.data;`}
                                </pre>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'settings' && (
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3>Application Settings</h3>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>Default Roles (Assigned to new users)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {roles.map(role => (
                                    <label key={role._id} className="flex-center" style={{ justifyContent: 'flex-start', padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={defaultRoleIds.includes(role._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setDefaultRoleIds([...defaultRoleIds, role._id]);
                                                else setDefaultRoleIds(defaultRoleIds.filter(id => id !== role._id));
                                            }}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem' }}>Allowed Redirect URIs (Comma separated)</label>
                                <Input
                                    value={redirectUris}
                                    onChange={(e) => setRedirectUris(e.target.value)}
                                    placeholder="http://localhost:5500/callback, https://myapp.com/auth"
                                />

                                <div style={{ marginTop: '2rem' }}>
                                    <Button onClick={handleUpdateSettings}>Save Settings</Button>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}>Danger Zone</h4>
                                <Button onClick={handleDeleteApp} style={{ background: '#ef4444', border: 'none' }}>Delete Application</Button>
                            </div>
                        </div>
                    </div>
                )}


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

            <Modal isOpen={isUserRoleModalOpen} onClose={() => setIsUserRoleModalOpen(false)} title="Manage User Roles">
                <form onSubmit={handleSaveUserRoles}>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {roles.map(role => (
                            <label key={role._id} className="flex-center" style={{ justifyContent: 'flex-start', padding: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedUserRoles.includes(role._id)}
                                    onChange={() => toggleUserRole(role._id)}
                                    style={{ marginRight: '8px' }}
                                />
                                {role.name}
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <Button type="submit">Save Roles</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default AppDetails;
