import React, { useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Authorize = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const clientId = searchParams.get('clientId');
    const redirectUri = searchParams.get('redirectUri');
    const codeChallenge = searchParams.get('codeChallenge');
    const codeChallengeMethod = searchParams.get('codeChallengeMethod');
    const state = searchParams.get('state');

    const [consentRequired, setConsentRequired] = React.useState(false);
    const [consentData, setConsentData] = React.useState(null);

    const checkApp = useCallback(async () => {
        try {
            // Check if app exists and if consent is needed
            const { data } = await api.post("/auth/authorize", {
                clientId,
                redirectUri,
                codeChallenge,
                codeChallengeMethod,
                state
            });

            if (data.code) {
                // First Party App - Auto Redirect
                const callbackUrl = new URL(redirectUri);
                callbackUrl.searchParams.set('code', data.code);
                if (data.state) callbackUrl.searchParams.set('state', data.state);
                window.location.href = callbackUrl.toString();
            } else {
                setConsentRequired(data.requiresConsent);
                setConsentData(data);
            }
        } catch (e) {
            console.error("Authorization check failed:", e);
            // Navigate to login on any error (such as 401 or failed token refresh resulting in 400/500)
            navigate(`/user-login?${searchParams.toString()}`);
        }
    }, [clientId, redirectUri, codeChallenge, codeChallengeMethod, state, navigate, searchParams]);

    useEffect(() => {
        if (clientId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            checkApp();
        }
    }, [clientId, checkApp]);

    const handleAllow = async () => {
        try {
            const { data } = await api.post("/auth/authorize", {
                clientId,
                redirectUri,
                consentGiven: true,
                codeChallenge,
                codeChallengeMethod,
                state
            });
            const callbackUrl = new URL(redirectUri);
            callbackUrl.searchParams.set('code', data.code);
            if (data.state) callbackUrl.searchParams.set('state', data.state);
            window.location.href = callbackUrl.toString();
        } catch {
            alert("Authorization failed");
        }
    };

    const handleDeny = () => {
        const callbackUrl = new URL(redirectUri);
        callbackUrl.searchParams.set('error', 'access_denied');
        callbackUrl.searchParams.set('error_description', 'User denied access');
        if (state) callbackUrl.searchParams.set('state', state);
        window.location.href = callbackUrl.toString();
    }

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("accessToken");
            // Refresh logic to restart flow
            navigate(`/user-login?${searchParams.toString()}`);
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
