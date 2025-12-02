import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types.js';
import { logout } from '$lib/server/auth.js';

export const actions: Actions = {
    default: async ({ cookies }) => {
        const refreshToken = cookies.get('refresh_token');
        
        if (refreshToken) {
            await logout(refreshToken);
        }
        
        cookies.delete('access_token', { path: '/' });
        cookies.delete('refresh_token', { path: '/' });
        
        throw redirect(303, '/');
    }
};