import type { Handle } from '@sveltejs/kit';
import { validateToken, refreshTokens, type AuthUser } from '$lib/server/auth.js';
import { getOrCreateProfile } from '$lib/server/db.js';

export const handle: Handle = async ({ event, resolve }) => {
    const accessToken = event.cookies.get('access_token');
    const refreshToken = event.cookies.get('refresh_token');
    
    let user: AuthUser | null = null;
    
    if (accessToken) {
        user = await validateToken(accessToken);
    }
    
    // If access token expired but we have refresh token, try to refresh
    if (!user && refreshToken) {
        const tokens = await refreshTokens(refreshToken);
        if (tokens) {
            // Set new tokens
            event.cookies.set('access_token', tokens.access_token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: tokens.expires_in
            });
            event.cookies.set('refresh_token', tokens.refresh_token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            
            user = await validateToken(tokens.access_token);
        }
    }
    
    if (user) {
        // Sync profile to local DB (creates if not exists, updates username if changed)
        const profile = getOrCreateProfile(user.id, user.username);
        
        event.locals.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            profile_image: profile.profile_image
        };
    }
    
    return resolve(event);
};
