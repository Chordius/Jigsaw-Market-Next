import { pool } from '@/lib/db';
import { fetchCentralBalance } from '@/lib/jigsawcoin';

export async function getUserProfileService(localUserId: string) {
    const query = `
        SELECT id, central_user_id, username, email, created_at
        FROM local_users
        WHERE id = $1
    `;

    const result = await pool.query(query, [localUserId]);

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    const user = result.rows[0];

    // Fetch balance from central wallet
    const balanceData = await fetchCentralBalance(user.central_user_id);

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: balanceData?.balance ?? 0,
        created_at: user.created_at,
    };
}
