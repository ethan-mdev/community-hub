import type { Handle } from '@sveltejs/kit';
import { getAuthenticatedUser } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = getAuthenticatedUser(event);
    return resolve(event);
};
