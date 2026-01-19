import { pool } from './connection.js';
import type { SearchResult } from './types.js';

export async function searchForum(query: string, limit: number = 20, offset: number = 0): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    
    // Escape special characters and prepare for tsquery
    const searchQuery = query.trim().split(/\s+/).map(word => `${word}:*`).join(' & ');
    
    const result = await pool.query(`
        SELECT 
            'thread' as type,
            t.id as thread_id,
            t.title as thread_title,
            NULL as post_id,
            t.title as content,
            u.username as author_username,
            c.name as category_name,
            c.slug as category_slug,
            t.created_at,
            ts_rank(to_tsvector('english', t.title), to_tsquery('english', $1)) as rank
        FROM forum.threads t
        LEFT JOIN public.users u ON t.author_id = u.id
        LEFT JOIN forum.categories c ON t.category_id = c.id
        WHERE t.is_deleted = false
            AND to_tsvector('english', t.title) @@ to_tsquery('english', $1)
        
        UNION ALL
        
        SELECT 
            'post' as type,
            t.id as thread_id,
            t.title as thread_title,
            p.id as post_id,
            p.content as content,
            u.username as author_username,
            c.name as category_name,
            c.slug as category_slug,
            p.created_at,
            ts_rank(to_tsvector('english', p.content), to_tsquery('english', $1)) as rank
        FROM forum.posts p
        JOIN forum.threads t ON p.thread_id = t.id
        LEFT JOIN public.users u ON p.author_id = u.id
        LEFT JOIN forum.categories c ON t.category_id = c.id
        WHERE p.is_deleted = false
            AND t.is_deleted = false
            AND to_tsvector('english', p.content) @@ to_tsquery('english', $1)
        
        ORDER BY rank DESC, created_at DESC
        LIMIT $2 OFFSET $3
    `, [searchQuery, limit, offset]);
    
    return result.rows as SearchResult[];
}

export async function getSearchResultCount(query: string): Promise<number> {
    if (!query.trim()) return 0;
    
    const searchQuery = query.trim().split(/\s+/).map(word => `${word}:*`).join(' & ');
    
    const result = await pool.query(`
        SELECT COUNT(*) as count FROM (
            SELECT t.id
            FROM forum.threads t
            WHERE t.is_deleted = false
                AND to_tsvector('english', t.title) @@ to_tsquery('english', $1)
            
            UNION ALL
            
            SELECT p.id
            FROM forum.posts p
            JOIN forum.threads t ON p.thread_id = t.id
            WHERE p.is_deleted = false
                AND t.is_deleted = false
                AND to_tsvector('english', p.content) @@ to_tsquery('english', $1)
        ) as results
    `, [searchQuery]);
    
    return parseInt(result.rows[0].count);
}
