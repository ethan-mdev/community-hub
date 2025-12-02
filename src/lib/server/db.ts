import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("forum.db");

// --- Initialize database schema ---
db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        FOREIGN KEY (author_id) REFERENCES profiles(user_id) ON DELETE CASCADE
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
        FOREIGN KEY (author_id) REFERENCES profiles(user_id) ON DELETE CASCADE
    );
`);

// --- Types ---
export type DbProfile = {
    user_id: string;
    username: string;
    profile_image: string | null;
    created_at: string;
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

// --- Profile functions ---
export function getOrCreateProfile(userId: string, username: string): DbProfile {
    const existing = db.prepare(`SELECT * FROM profiles WHERE user_id = ?`).get(userId) as DbProfile | undefined;
    
    if (existing) {
        // Update username if changed
        if (existing.username !== username) {
            db.prepare(`UPDATE profiles SET username = ? WHERE user_id = ?`).run(username, userId);
        }
        return { ...existing, username };
    }
    
    db.prepare(`INSERT INTO profiles (user_id, username) VALUES (?, ?)`).run(userId, username);
    return { user_id: userId, username, profile_image: null, created_at: new Date().toISOString() };
}

export function getProfileById(userId: string): DbProfile | undefined {
    return db.prepare(`SELECT * FROM profiles WHERE user_id = ?`).get(userId) as DbProfile | undefined;
}

export function updateProfileImage(userId: string, profileImage: string): void {
    db.prepare(`UPDATE profiles SET profile_image = ? WHERE user_id = ?`).run(profileImage, userId);
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
    const category = db.prepare(`SELECT * FROM categories WHERE slug = ?`).get(slug) as DbCategory | undefined;
    
    if (!category) return null;
    
    const threads = db.prepare(`
        SELECT t.*, p.username as author_username
        FROM threads t
        LEFT JOIN profiles p ON t.author_id = p.user_id
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

export function getPostsByThreadId(threadId: number, limit?: number, offset?: number): (DbPost & { author_username: string; author_profile_image: string | null })[] {
    let query = `
        SELECT posts.*, profiles.username as author_username, profiles.profile_image as author_profile_image
        FROM posts
        LEFT JOIN profiles ON posts.author_id = profiles.user_id
        WHERE posts.thread_id = ? AND posts.is_deleted = 0
        ORDER BY posts.created_at ASC
    `;
    
    if (limit !== undefined) {
        query += ` LIMIT ${limit}`;
        if (offset !== undefined) {
            query += ` OFFSET ${offset}`;
        }
    }
    
    const posts = db.prepare(query).all(threadId) as (DbPost & { author_username: string; author_profile_image: string | null })[];
    return posts;
}

export function getTotalPostsInThread(threadId: number): number {
    const row = db.prepare(`
        SELECT COUNT(*) as count 
        FROM posts 
        WHERE thread_id = ? AND is_deleted = 0
    `).get(threadId) as { count: number };
    return row.count;
}

export function getThreadById(threadId: number): (DbThread & { author_username: string; category_name: string; category_slug: string }) | null {
    const thread = db.prepare(`
        SELECT threads.*, profiles.username as author_username, categories.name as category_name, categories.slug as category_slug
        FROM threads
        LEFT JOIN profiles ON threads.author_id = profiles.user_id
        LEFT JOIN categories ON threads.category_id = categories.id
        WHERE threads.id = ? AND threads.is_deleted = 0
    `).get(threadId) as (DbThread & { author_username: string; category_name: string; category_slug: string }) | undefined;
    return thread || null;
}

export function createThread(threadData: {
    categoryId: string;
    title: string;
    authorId: string;
    isSticky: boolean;
    isLocked: boolean;
    initialContent: string;
}): DbThread {
    const stmt = db.prepare(`
        INSERT INTO threads (category_id, title, author_id, is_sticky, is_locked, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    const result = stmt.run(
        threadData.categoryId,
        threadData.title,
        threadData.authorId,
        threadData.isSticky ? 1 : 0,
        threadData.isLocked ? 1 : 0
    );
    
    const threadId = result.lastInsertRowid as number;
    
    // Create the initial post
    createPost({
        thread_id: threadId,
        author_id: threadData.authorId,
        content: threadData.initialContent
    });
    
    // Return the created thread
    const thread = db.prepare(`
        SELECT * FROM threads WHERE id = ?
    `).get(threadId) as DbThread;
    
    return thread;
}

export function createPost(postData: { thread_id: number; author_id: string; content: string }): DbPost {
    const stmt = db.prepare(`
        INSERT INTO posts (thread_id, author_id, content, created_at, updated_at, is_deleted)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    `);
    
    const result = stmt.run(postData.thread_id, postData.author_id, postData.content);
    
    // Update thread's updated_at timestamp
    db.prepare(`
        UPDATE threads 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `).run(postData.thread_id);
    
    // Return the created post
    return db.prepare(`
        SELECT * FROM posts WHERE id = ?
    `).get(result.lastInsertRowid) as DbPost;
}

// Initialize seed data on first run
import { seedDatabase } from './seed.js';
seedDatabase();
