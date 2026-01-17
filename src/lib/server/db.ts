import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/postgres'
});

// Set search path to forum schema by default
pool.on('connect', (client) => {
    client.query('SET search_path TO forum, public');
});

// --- Types ---
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

// --- Category-related functions ---
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
        SELECT t.*, u.username as author_username
        FROM forum.threads t
        LEFT JOIN public.users u ON t.author_id = u.id
        WHERE t.category_id = $1 AND t.is_deleted = false
        ORDER BY t.is_sticky DESC, t.updated_at DESC
    `, [category.id]);
    
    return {
        ...category,
        threads: threadsResult.rows as (DbThread & { author_username: string })[]
    };
}

// --- Thread related functions ---
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

// --- Post related functions ---
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
    await createPost({
        thread_id: thread.id,
        author_id: threadData.authorId,
        content: threadData.initialContent
    });
    
    return thread;
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
