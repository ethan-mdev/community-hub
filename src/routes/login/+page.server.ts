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

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return fail(400, { error: 'Please enter a valid email address', email, username });
        }

        // Username validation
        if (username.length < 4 || username.length > 20) {
            return fail(400, { error: 'Username must be between 4-20 characters', email, username });
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return fail(400, { error: 'Username can only contain letters, numbers, underscores, and hyphens', email, username });
        }

        // Password validation
        if (password.length < 6) {
            return fail(400, { error: 'Password must be at least 6 characters long', email, username });
        }

        try {
            await registerUser(event, email, username, password);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Email already exists')) {
                    return fail(400, { error: 'Email already exists', email, username });
                }
                if (error.message.includes('Username already exists')) {
                    return fail(400, { error: 'Username already exists', email, username });
                }
            }
            return fail(500, { error: 'Registration failed. Please try again.', email, username });
        }

        // If we get here, registration was successful
        throw redirect(303, '/');
    }
};