import type { Handle } from '@sveltejs/kit';
import { validateToken, refreshTokens, type AuthUser } from '$lib/server/auth.js';

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
        event.locals.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            profile_image: null // Will be populated by layout.server.ts
        };
    }
    
    return resolve(event);
};
