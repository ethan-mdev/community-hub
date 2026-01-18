import pg from 'pg';
import { DATABASE_URL } from '$env/static/private';
const { Pool } = pg;

const pool = new Pool({
    connectionString: DATABASE_URL
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

// --- Search functions ---
export type SearchResult = {
    type: 'thread' | 'post';
    thread_id: number;
    thread_title: string;
    post_id?: number;
    content: string;
    author_username: string;
    category_name: string;
    category_slug: string;
    created_at: string;
    rank: number;
};

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

// --- Reaction functions ---
export type ReactionType = 'like' | 'heart' | 'laugh' | 'sad' | 'wow' | 'angry' | 'celebrate';

export type PostReactions = {
    like: number;
    heart: number;
    laugh: number;
    sad: number;
    wow: number;
    angry: number;
    celebrate: number;
};

export type UserReaction = {
    reaction_type: ReactionType;
};

export async function getPostReactions(postId: number): Promise<PostReactions> {
    const result = await pool.query(`
        SELECT reaction_type, COUNT(*) as count
        FROM forum.post_reactions
        WHERE post_id = $1
        GROUP BY reaction_type
    `, [postId]);
    
    const reactions: PostReactions = { like: 0, heart: 0, laugh: 0, sad: 0, wow: 0, angry: 0, celebrate: 0 };
    result.rows.forEach((row: { reaction_type: ReactionType; count: string }) => {
        reactions[row.reaction_type] = parseInt(row.count);
    });
    
    return reactions;
}

export async function getUserReactionsForPost(postId: number, userId: string): Promise<ReactionType[]> {
    const result = await pool.query(`
        SELECT reaction_type
        FROM forum.post_reactions
        WHERE post_id = $1 AND user_id = $2
    `, [postId, userId]);
    
    return result.rows.map((row: { reaction_type: ReactionType }) => row.reaction_type);
}

export async function addReaction(postId: number, userId: string, reactionType: ReactionType): Promise<void> {
    await pool.query(`
        INSERT INTO forum.post_reactions (post_id, user_id, reaction_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (post_id, user_id, reaction_type) DO NOTHING
    `, [postId, userId, reactionType]);
}

export async function removeReaction(postId: number, userId: string, reactionType: ReactionType): Promise<void> {
    await pool.query(`
        DELETE FROM forum.post_reactions
        WHERE post_id = $1 AND user_id = $2 AND reaction_type = $3
    `, [postId, userId, reactionType]);
}

export async function toggleReaction(postId: number, userId: string, reactionType: ReactionType): Promise<'added' | 'removed'> {
    // Check if this specific reaction exists
    const existing = await pool.query(`
        SELECT 1 FROM forum.post_reactions
        WHERE post_id = $1 AND user_id = $2 AND reaction_type = $3
    `, [postId, userId, reactionType]);
    
    if (existing.rows.length > 0) {
        await removeReaction(postId, userId, reactionType);
        return 'removed';
    } else {
        await addReaction(postId, userId, reactionType);
        return 'added';
    }
}

// --- Badge functions ---
export type Badge = {
    id: number;
    name: string;
    bg_color: string;
    text_color: string;
};

export async function getUserBadges(userId: string): Promise<Badge[]> {
    const result = await pool.query(`
        SELECT b.id, b.name, b.bg_color, b.text_color
        FROM forum.user_badges ub
        JOIN forum.badges b ON ub.badge_id = b.id
        WHERE ub.user_id = $1
        ORDER BY ub.awarded_at DESC
    `, [userId]);
    
    return result.rows;
}
