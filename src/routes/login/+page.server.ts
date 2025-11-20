import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { loginUser, registerUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(302, '/');
    }
    return {};
}

export const actions: Actions = {
    login: async (event) => {
        const data = await event.request.formData();
        const username = String(data.get('username') || '').trim();
        const password = String(data.get('password') || '');

        if (!username || !password) {
            return fail(400, { error: 'Username and password required', username });
        }

        const user = await loginUser(event, username, password);
        if (!user) {
            return fail(400, { error: 'Invalid username or password', username });
        }

        throw redirect(303, '/');
    },

    register: async (event) => {
        const data = await event.request.formData();
        const email = String(data.get('email') || '').trim();
        const username = String(data.get('username') || '').trim();
        const password = String(data.get('password') || '');

        if (!email || !username || !password) {
            return fail(400, { error: 'All fields required', email, username });
        }

        await registerUser(event, email, username, password);
        throw redirect(303, '/');
    }
};