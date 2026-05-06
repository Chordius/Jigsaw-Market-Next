import { pool } from '@/lib/db';

export async function getCommentsByMarketIdService(marketId: string) {
    const client = await pool.connect();
    
    try {
        const result = await client.query(`
            SELECT 
                c.id AS comment_id,
                c.content,
                c.created_at,
                u.id AS local_user_id,
                u.username
            FROM comments c
            JOIN local_users u 
            ON c.local_user_id = u.id
            WHERE c.market_id = $1
            ORDER BY c.created_at DESC
        `, [marketId]);

        return result.rows;
    } finally {
        client.release();
    }
}

export async function createCommentService(localUserId: string, marketId: string, content: string) {
    const client = await pool.connect();
    
    try {
        const result = await client.query(`
            WITH new_comment AS (
                INSERT INTO comments (local_user_id, market_id, content)
                VALUES ($1, $2, $3)
                RETURNING id AS comment_id, content, created_at, local_user_id
            )
            SELECT 
                nc.comment_id,
                nc.content,
                nc.created_at,
                nc.local_user_id,
                u.username
            FROM new_comment nc
            JOIN local_users u ON nc.local_user_id = u.id;
        `, [localUserId, marketId, content]);

        return result.rows[0];
    } finally {
        client.release();
    }
}