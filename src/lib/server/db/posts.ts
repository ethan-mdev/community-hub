import { pool } from './connection.js';
import type { DbPost } from './types.js';

export async function getTotalPostCount(): Promise<number> {
    const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM forum.posts 
        WHERE is_deleted = false
    `);
    return parseInt(result.rows[0].count);
}

export async function getPostsByThreadId(threadId: number, limit?: number, offset?: number): Promise<(DbPost & { author_username: string; author_profile_image: string | null; author_post_count: number; author_role: string })[]> {
    let query = `
        SELECT p.*, 
               u.username as author_username, 
               u.profile_image as author_profile_image,
               u.role as author_role,
               u.created_at as author_joined_at,
               (SELECT COUNT(*) FROM forum.posts WHERE author_id = p.author_id AND is_deleted = false) as author_post_count
        FROM forum.posts p
        LEFT JOIN public.users u ON p.author_id = u.id
        WHERE p.thread_id = $1 AND p.is_deleted = false
        ORDER BY p.created_at ASC
    `;
    
    const params: any[] = [threadId];
    
    if (limit !== undefined) {
        query += ` LIMIT $2`;
        params.push(limit);
        if (offset !== undefined) {
            query += ` OFFSET $3`;
            params.push(offset);
        }
    }
    
    const result = await pool.query(query, params);
    return result.rows as (DbPost & { author_username: string; author_profile_image: string | null; author_post_count: number; author_role: string })[];
}

export async function getTotalPostsInThread(threadId: number): Promise<number> {
    const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM forum.posts 
        WHERE thread_id = $1 AND is_deleted = false
    `, [threadId]);
    return parseInt(result.rows[0].count);
}

export async function createPost(postData: { thread_id: number; author_id: string; content: string }): Promise<DbPost> {
    const result = await pool.query(`
        INSERT INTO forum.posts (thread_id, author_id, content, created_at, updated_at, is_deleted)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)
        RETURNING *
    `, [postData.thread_id, postData.author_id, postData.content]);
    
    // Update thread's updated_at timestamp
    await pool.query(`
        UPDATE forum.threads 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
    `, [postData.thread_id]);
    
    return result.rows[0] as DbPost;
}
