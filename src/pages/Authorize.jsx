import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Authorize = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [appInfo, setAppInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const clientId = searchParams.get('clientId');
    const redirectUri = searchParams.get('redirectUri');
    const codeChallenge = searchParams.get('codeChallenge');
    const codeChallengeMethod = searchParams.get('codeChallengeMethod');

    const [consentRequired, setConsentRequired] = React.useState(false);
    const [consentData, setConsentData] = React.useState(null);

    useEffect(() => {
        if (clientId) {
            checkApp();
        }
    }, [clientId]);

    const checkApp = async () => {
        try {
            // Check if app exists and if consent is needed
            const { data } = await api.post("/auth/authorize", {
                clientId,
                redirectUri,
                codeChallenge,
                codeChallengeMethod
            });

            if (data.code) {
                // First Party App - Auto Redirect
                window.location.href = `${redirectUri}?code=${data.code}`;
            } else {
                setAppInfo(data);
                setConsentRequired(data.requiresConsent);
                setConsentData(data);
            }
        } catch (e) {
            console.error(e);
            if (e.response && e.response.status === 401) {
                navigate(`/user-login?clientId=${clientId}&redirectUri=${redirectUri}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAllow = async () => {
        try {
            const { data } = await api.post("/auth/authorize", {
                clientId,
                redirectUri,
                consentGiven: true,
                codeChallenge,
                codeChallengeMethod
            });
            window.location.href = `${redirectUri}?code=${data.code}`;
        } catch (e) {
            alert("Authorization failed");
        }
    };

    const handleDeny = () => {
        // Redirect back to app with error? or just show message
        window.location.href = `${redirectUri}?error=access_denied&error_description=User denied access`;
    }

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
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
