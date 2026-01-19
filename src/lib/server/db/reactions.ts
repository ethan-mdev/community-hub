import { pool } from './connection.js';
import type { ReactionType, PostReactions } from './types.js';

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
