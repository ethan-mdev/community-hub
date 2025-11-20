import bcrypt from 'bcrypt';
import { createSession, createUser, deleteSession, getUserWithSession, getUserById, type DbUser, getUserByUsername } from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';

const SESSION_COOKIE = 'forum_session';

export type AuthenticatedUser = Omit<DbUser, 'password_hash'>;

function sanitizeUser(user: DbUser): AuthenticatedUser {
    const { password_hash, ...sanitized } = user;
    return sanitized;
}

export function getAuthenticatedUser(event: RequestEvent): AuthenticatedUser | null {
    const sessionId = event.cookies.get(SESSION_COOKIE);

    if (!sessionId) return null;

    const sessionWithUser = getUserWithSession(sessionId);

    if (!sessionWithUser) {
        event.cookies.delete(SESSION_COOKIE, { path: '/' });
        return null;
    }

    return sanitizeUser(sessionWithUser.user);
}

export async function registerUser(event: RequestEvent, email: string, username: string, password: string): Promise<AuthenticatedUser> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser(email, username, passwordHash);
    const session = createSession(user.id);

    event.cookies.set(SESSION_COOKIE, session.id, {
        path: '/', httpOnly: true, sameSite: 'lax', secure: false // set to true in production
    });

    return sanitizeUser(user);
}

export async function loginUser(event: RequestEvent, username: string, password: string): Promise<AuthenticatedUser | null> {
    const user = getUserByUsername(username);

    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) return null;

    const session = createSession(user.id);
    event.cookies.set(SESSION_COOKIE, session.id, {
        path: '/', httpOnly: true, sameSite: 'lax', secure: false // set to true in production
    });

    return sanitizeUser(user);
}

export async function logoutUser(event: RequestEvent): Promise<void> {
    const sessionId = event.cookies.get(SESSION_COOKIE);

    if (sessionId) {
        deleteSession(sessionId);
        event.cookies.delete(SESSION_COOKIE, { path: '/' });
    }
}

export function requireUser(event: RequestEvent): AuthenticatedUser {
    const user = event.locals.user;

    if (!user) {
        throw new Error('User not authenticated');
    }
    return user;
}