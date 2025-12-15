import * as jose from 'jose';

const AUTH_SERVER = process.env.AUTH_SERVER_URL || 'http://localhost:8080';

// Cache JWKS for performance
let jwks: jose.JWTVerifyGetKey | null = null;

function getJWKS() {
    if (!jwks) {
        jwks = jose.createRemoteJWKSet(new URL(`${AUTH_SERVER}/.well-known/jwks.json`));
    }
    return jwks;
}

export type AuthUser = {
    id: string;
    username: string;
    role: string;
};

export type TokenPair = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
};

// Validate JWT and return user info
export async function validateToken(token: string): Promise<AuthUser | null> {
    try {
        const { payload } = await jose.jwtVerify(token, getJWKS());
        return {
            id: payload.user_id as string,
            username: payload.username as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

// Call auth server to login
export async function login(username: string, password: string): Promise<TokenPair | null> {
    const res = await fetch(`${AUTH_SERVER}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) return null;
    return res.json();
}

// Call auth server to register
export async function register(username: string, email: string, password: string): Promise<TokenPair | null> {
    const res = await fetch(`${AUTH_SERVER}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Registration failed:', res.status, errorText);
        return null;
    }
    return res.json();
}

// Call auth server to refresh tokens
export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    const res = await fetch(`${AUTH_SERVER}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!res.ok) return null;
    return res.json();
}

// Call auth server to logout
export async function logout(refreshToken: string): Promise<void> {
    await fetch(`${AUTH_SERVER}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });
}

// Fetch user profile from auth service
export async function getUserProfile(userId: string): Promise<{ user_id: string; username: string; email: string; role: string; profile_image: string | null } | null> {
    try {
        const res = await fetch(`${AUTH_SERVER}/profile/${userId}`);
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// Update user profile in auth service
export async function updateUserProfile(accessToken: string, profileImage: string): Promise<boolean> {
    try {
        const res = await fetch(`${AUTH_SERVER}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profile_image: profileImage })
        });
        return res.ok;
    } catch {
        return false;
    }
}