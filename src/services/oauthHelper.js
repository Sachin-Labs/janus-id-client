// OAuth 2.0 / 2.1 state persistence helper
const OAUTH_KEYS = [
    'clientId',
    'redirectUri',
    'state',
    'codeChallenge',
    'codeChallengeMethod'
];

export const saveOAuthState = (searchParams) => {
    let savedAny = false;
    OAUTH_KEYS.forEach(key => {
        const val = searchParams.get(key);
        if (val) {
            sessionStorage.setItem(`janus_oauth_${key}`, val);
            savedAny = true;
        }
    });
    return savedAny;
};

export const getOAuthState = () => {
    const state = {};
    let hasState = false;
    OAUTH_KEYS.forEach(key => {
        const val = sessionStorage.getItem(`janus_oauth_${key}`);
        if (val) {
            state[key] = val;
            hasState = true;
        }
    });
    return hasState ? state : null;
};

export const getOAuthQueryString = () => {
    const state = getOAuthState();
    if (!state) return '';
    const params = new URLSearchParams(state);
    return params.toString();
};

export const clearOAuthState = () => {
    OAUTH_KEYS.forEach(key => {
        sessionStorage.removeItem(`janus_oauth_${key}`);
    });
};
