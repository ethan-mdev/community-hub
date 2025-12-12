import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { login, register } from '$lib/server/auth.js';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(303, '/');
    }
    return {};
};

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = String(data.get('username') || '').trim();
        const password = String(data.get('password') || '');

        if (!username || !password) {
            return fail(400, { error: 'Username and password are required' });
        }

        const tokens = await login(username, password);
        if (!tokens) {
            return fail(401, { error: 'Invalid username or password' });
        }

        cookies.set('access_token', tokens.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokens.expires_in
        });
        cookies.set('refresh_token', tokens.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        throw redirect(303, '/');
    },

    register: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = String(data.get('username') || '').trim();
        const email = String(data.get('email') || '').trim();
        const password = String(data.get('password') || '');

        if (!username || !email || !password) {
            return fail(400, { error: 'All fields are required' });
        }

        const tokens = await register(username, email, password);
        if (!tokens) {
            console.error('Registration failed for:', username, email);
            return fail(400, { error: 'Registration failed - username or email may already exist' });
        }

        cookies.set('access_token', tokens.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokens.expires_in
        });
        cookies.set('refresh_token', tokens.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        throw redirect(303, '/');
    }
};