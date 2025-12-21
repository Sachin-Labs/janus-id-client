import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Authorize = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const clientId = searchParams.get('clientId');
    const redirectUri = searchParams.get('redirectUri');

    const [consentRequired, setConsentRequired] = React.useState(false);
    const [consentData, setConsentData] = React.useState(null);

    useEffect(() => {
        if (!clientId || !redirectUri) return;

        authorizeUser();
    }, [clientId, redirectUri, navigate]);

    const authorizeUser = async (consentGiven = false) => {
        try {
            const response = await axios.post('http://localhost:8000/oauth/authorize', {
                clientId,
                redirectUri,
                consentGiven
            }, { withCredentials: true });

            if (response.data.requiresConsent) {
                setConsentRequired(true);
                setConsentData(response.data);
                return;
            }

            const { code, redirectUri: callbackUrl } = response.data;
            window.location.href = `${callbackUrl}?code=${code}`;

        } catch (err) {
            if (err.response && err.response.status === 401) {
                navigate(`/user-login?clientId=${clientId}&redirectUri=${redirectUri}`);
            } else {
                console.error("Authorization Error:", err);
                alert("Authorization failed: " + (err.response?.data || err.message));
            }
        }
    };

    const handleAllow = () => {
        authorizeUser(true);
    };

    const handleDeny = () => {
        // Redirect back to app with error? or just show message
        window.location.href = `${redirectUri}?error=access_denied&error_description=User denied access`;
    }

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8000/api/auth/logout', {}, { withCredentials: true });
            // Refresh logic to restart flow
            navigate(`/user-login?clientId=${clientId}&redirectUri=${redirectUri}`);
        } catch (e) {
            console.error("Logout failed", e);
            alert("Logout failed");
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

    if (consentRequired && consentData) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-card)' }}>
                <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Authorize Access</h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Application <strong>{consentData.appName}</strong> wants to access your account.
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius)' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>It will be able to:</p>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {consentData.scopes.map(scope => (
                                <li key={scope}>Read your {scope}</li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleDeny}
                            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Deny
                        </button>
                        <button
                            onClick={handleAllow}
                            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Allow
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Not you?
                        </p>
                        <button
                            onClick={handleLogout}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Logout & Switch Account
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', background: 'var(--bg-card)' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Authorizing...</p>
            <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(99, 102, 241, 0.1);
                    border-left-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
             `}</style>
        </div>
    );
};

export default Authorize;
