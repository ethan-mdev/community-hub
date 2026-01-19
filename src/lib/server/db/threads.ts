import { pool } from './connection.js';
import type { DbThread, DbPost } from './types.js';

export async function getNumberOfThreads(categoryId: string): Promise<number> {
    const result = await pool.query(`
        SELECT COUNT(*) as count FROM forum.threads WHERE category_id = $1
    `, [categoryId]);
    return parseInt(result.rows[0].count);
}

export async function getTotalThreadCount(): Promise<number> {
    const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM forum.threads 
        WHERE is_deleted = false
    `);
    return parseInt(result.rows[0].count);
}

export async function getThreadById(threadId: number): Promise<(DbThread & { author_username: string; category_name: string; category_slug: string }) | null> {
    const result = await pool.query(`
        SELECT t.*, u.username as author_username, c.name as category_name, c.slug as category_slug
        FROM forum.threads t
        LEFT JOIN public.users u ON t.author_id = u.id
        LEFT JOIN forum.categories c ON t.category_id = c.id
        WHERE t.id = $1 AND t.is_deleted = false
    `, [threadId]);
    return result.rows[0] || null;
}

export async function createThread(threadData: {
    categoryId: string;
    title: string;
    authorId: string;
    isSticky: boolean;
    isLocked: boolean;
    initialContent: string;
}): Promise<DbThread> {
    const result = await pool.query(`
        INSERT INTO forum.threads (category_id, title, author_id, is_sticky, is_locked, is_deleted, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
    `, [
        threadData.categoryId,
        threadData.title,
        threadData.authorId,
        threadData.isSticky,
        threadData.isLocked
    ]);
    
    const thread = result.rows[0] as DbThread;
    
    // Create the initial post
    await pool.query(`
        INSERT INTO forum.posts (thread_id, author_id, content, created_at, updated_at, is_deleted)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)
    `, [thread.id, threadData.authorId, threadData.initialContent]);
    
    return thread;
}

export async function toggleThreadSticky(threadId: number): Promise<void> {
    await pool.query(`
        UPDATE forum.threads 
        SET is_sticky = NOT is_sticky 
        WHERE id = $1
    `, [threadId]);
}

export async function toggleThreadLock(threadId: number): Promise<void> {
    await pool.query(`
        UPDATE forum.threads 
        SET is_locked = NOT is_locked 
        WHERE id = $1
    `, [threadId]);
}

export async function deleteThread(threadId: number): Promise<void> {
    await pool.query(`
        UPDATE forum.threads 
        SET is_deleted = true 
        WHERE id = $1
    `, [threadId]);
}
