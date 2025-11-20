import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("forum.db");

// --- Initialize database schema ---
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        profile_image TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        parent_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        slug TEXT UNIQUE,
        is_locked BOOLEAN DEFAULT 0,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        author_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_locked BOOLEAN DEFAULT 0,
        is_sticky BOOLEAN DEFAULT 0,
        is_deleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER NOT NULL,
        author_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

// --- Types ---
export type DbUser = {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    created_at: string;
    profile_image: string | null;
};

export type DbSession = {
    id: string;
    user_id: string;
    created_at: string;
    expires_at: string;
};

export type DbCategory = {
    id: string;
    parent_id: string | null;
    name: string;
    description: string | null;
    image: string | null;
    is_locked: boolean;
    slug: string;
    thread_count?: number;
};

export type DbThread = {
    id: number;
    category_id: string;
    title: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    is_locked: boolean;
    is_sticky: boolean;
    is_deleted: boolean;
    author_username?: string;
};

export type DbPost = {
    id: number;
    thread_id: number;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    author_username?: string;
};

// --- User-related functions ---
export function createUser(email: string, username: string, password_hash: string): DbUser {
    const id = randomUUID();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
        INSERT INTO users (id, email, username, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(id, email, username, password_hash, now);

    return getUserById(id)!;
};

export function getUserById(id: string): DbUser | undefined {
    const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as DbUser | undefined;
    return row || undefined;
};

export function getUserByUsername(username: string): DbUser | undefined {
    const row = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as DbUser | undefined;
    return row || undefined;
}

export function updateUserProfileImage(userId: string, profileImage: string): void {
    db.prepare(`
        UPDATE users 
        SET profile_image = ? 
        WHERE id = ?
    `).run(profileImage, userId);
}

// --- Session-related functions ---
export function createSession(userId: string): DbSession {
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    db.prepare(`
        INSERT INTO sessions (id, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    `).run(id, userId, now.toISOString(), expiresAt.toISOString());

    return {
        id,
        user_id: userId,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
    };
}

export function getUserWithSession(sessionId: string): { session: DbSession; user: DbUser } | undefined {
    const row = db.prepare(`
        SELECT s.*, u.*
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
    `).get(sessionId) as (DbSession & DbUser) | undefined;

    if (!row) return undefined;

    const session: DbSession = {
        id: row.id,
        user_id: row.user_id,
        created_at: row.created_at,
        expires_at: row.expires_at
    };

    const user: DbUser = {
        id: row.id,
        email: row.email,
        username: row.username,
        password_hash: row.password_hash,
        created_at: row.created_at,
        profile_image: row.profile_image
    };

    return { session, user };
}

export function deleteSession(sessionId: string): void {
    db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId);
}

// --- Category-related functions ---
export function getCategoriesWithChildren(): (DbCategory & { children: (DbCategory & { thread_count: number })[] })[] {
    // Get parent categories (no parent_id)
    const parents = db.prepare(`SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name`).all() as DbCategory[];
    
    return parents.map(parent => ({
        ...parent,
        children: (db.prepare(`SELECT * FROM categories WHERE parent_id = ? ORDER BY name`)
            .all(parent.id) as DbCategory[])
            .map((child: DbCategory) => ({
                ...child,
                thread_count: getNumberOfThreads(child.id)
            }))
    }));
}

export function getCategoryBySlug(slug: string): (DbCategory & { threads: (DbThread & { author_username: string })[] }) | null {
    // Get the category
    const category = db.prepare(`SELECT * FROM categories WHERE slug = ?`).get(slug) as DbCategory | undefined;
    
    if (!category) return null;
    
    // Get threads for this category with author username
    const threads = db.prepare(`
        SELECT t.*, u.username as author_username
        FROM threads t
        LEFT JOIN users u ON t.author_id = u.id
        WHERE t.category_id = ? AND t.is_deleted = 0
        ORDER BY t.is_sticky DESC, t.updated_at DESC
    `).all(category.id) as (DbThread & { author_username: string })[];
    
    return {
        ...category,
        threads
    };
}

// --- Thread related functions ---
export function getNumberOfThreads(categoryId: string): number {
    const row = db.prepare(`
        SELECT COUNT(*) as count FROM threads WHERE category_id = ?
    `).get(categoryId) as { count: number };
    return row.count;
}

export function getTotalThreadCount(): number {
    const row = db.prepare(`
        SELECT COUNT(*) as count 
        FROM threads 
        WHERE is_deleted = 0
    `).get() as { count: number };
    return row.count;
}

// --- Post related functions ---
export function getTotalPostCount(): number {
    const row = db.prepare(`
        SELECT COUNT(*) as count 
        FROM posts 
        WHERE is_deleted = 0
    `).get() as { count: number };
    return row.count;
}

export function getPostsByThreadId(threadId: number): (DbPost & { author_username: string })[] {
    const posts = db.prepare(`
        SELECT posts.*, users.username as author_username
        FROM posts
        LEFT JOIN users ON posts.author_id = users.id
        WHERE posts.thread_id = ? AND posts.is_deleted = 0
        ORDER BY posts.created_at ASC
    `).all(threadId) as (DbPost & { author_username: string })[];
    return posts;
}

// Initialize seed data on first run
import { seedDatabase } from './seed.js';
seedDatabase();
