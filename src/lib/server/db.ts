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

// --- Thread related functions ---
export function getNumberOfThreads(categoryId: string): number {
    const row = db.prepare(`
        SELECT COUNT(*) as count FROM threads WHERE category_id = ?
    `).get(categoryId) as { count: number };
    return row.count;
};

export function getTotalThreadCount(): number {
    const row = db.prepare(`
        SELECT COUNT(*) as count 
        FROM threads 
        WHERE is_deleted = 0
    `).get() as { count: number };
    return row.count;
}

// Initialize seed data on first run
import { seedDatabase } from './seed.js';
seedDatabase();
