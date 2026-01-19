import { pool } from './connection.js';
import type { DbCategory, DbThread } from './types.js';

async function getNumberOfThreads(categoryId: string): Promise<number> {
    const result = await pool.query(`
        SELECT COUNT(*) as count FROM forum.threads WHERE category_id = $1 AND is_deleted = false
    `, [categoryId]);
    return parseInt(result.rows[0].count);
}

export async function getCategoriesWithChildren(): Promise<(DbCategory & { children: (DbCategory & { thread_count: number })[] })[]> {
    const result = await pool.query(`SELECT * FROM forum.categories WHERE parent_id IS NULL ORDER BY name`);
    const parents = result.rows as DbCategory[];
    
    const withChildren = await Promise.all(parents.map(async (parent) => {
        const childrenResult = await pool.query(`SELECT * FROM forum.categories WHERE parent_id = $1 ORDER BY name`, [parent.id]);
        const children = await Promise.all((childrenResult.rows as DbCategory[]).map(async (child) => ({
            ...child,
            thread_count: await getNumberOfThreads(child.id)
        })));
        return { ...parent, children };
    }));
    
    return withChildren;
}

export async function getCategoryBySlug(slug: string): Promise<(DbCategory & { threads: (DbThread & { author_username: string })[] }) | null> {
    const result = await pool.query(`SELECT * FROM forum.categories WHERE slug = $1`, [slug]);
    const category = result.rows[0] as DbCategory | undefined;
    
    if (!category) return null;
    
    const threadsResult = await pool.query(`
        SELECT 
            t.*,
            u.username as author_username,
            u.profile_image as author_profile_image,
            COUNT(p.id) as reply_count,
            MAX(p.created_at) as last_reply_at,
            (SELECT u2.username FROM forum.posts p2 
             LEFT JOIN public.users u2 ON p2.author_id = u2.id 
             WHERE p2.thread_id = t.id AND p2.is_deleted = false 
             ORDER BY p2.created_at DESC LIMIT 1) as last_reply_username
        FROM forum.threads t
        LEFT JOIN public.users u ON t.author_id = u.id
        LEFT JOIN forum.posts p ON p.thread_id = t.id AND p.is_deleted = false
        WHERE t.category_id = $1 AND t.is_deleted = false
        GROUP BY t.id, u.username, u.profile_image
        ORDER BY t.is_sticky DESC, t.updated_at DESC
    `, [category.id]);
    
    return {
        ...category,
        threads: threadsResult.rows as (DbThread & { author_username: string })[]
    };
}
