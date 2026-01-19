import { pool } from './connection.js';
import type { Badge } from './types.js';

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
