import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { updateUserProfileImage } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';

export const actions: Actions = {
    default: async (event) => {
        const user = requireUser(event);
        const data = await event.request.formData();
        const avatar = String(data.get('avatar') || '').trim();

        if (!avatar) {
            return fail(400, { error: 'Avatar selection required' });
        }

        try {
            updateUserProfileImage(user.id, avatar);
            return { success: true };
        } catch (error) {
            console.error('Error updating profile image:', error);
            return fail(500, { error: 'Failed to update profile image' });
        }
    }
};