import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { logoutUser } from '$lib/server/auth';

export const actions: Actions = {
    default: async (event) => {
        await logoutUser(event);
        throw redirect(302, '/');
    }
};