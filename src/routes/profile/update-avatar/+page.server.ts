import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { updateUserProfile } from '$lib/server/auth';

export const actions: Actions = {
    default: async (event) => {
        if (!event.locals.user) {
            throw redirect(303, '/login');
        }

        const data = await event.request.formData();
        const avatar = String(data.get('avatar') || '').trim();

        if (!avatar) {
            return fail(400, { error: 'Avatar selection required' });
        }

        // Get access token from cookies
        const accessToken = event.cookies.get('access_token');
        if (!accessToken) {
            throw redirect(303, '/login');
        }

        try {
            const success = await updateUserProfile(accessToken, avatar);
            if (!success) {
                return fail(500, { error: 'Failed to update profile image' });
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating profile image:', error);
            return fail(500, { error: 'Failed to update profile image' });
        }
    }
};