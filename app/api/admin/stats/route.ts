import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { baseResponse } from '@/lib/base_response';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.user) {
             return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        const client = await pool.connect();
        try {
            const userCheck = await client.query('SELECT is_admin FROM local_users WHERE id = $1', [session.user.id]);
            if (userCheck.rows.length === 0 || !userCheck.rows[0].is_admin) {
                 return NextResponse.json(baseResponse(false, 'Forbidden', null), { status: 403 });
            }

            const statsRes = await client.query(`
                SELECT
                    (SELECT COUNT(*) FROM markets WHERE status = 'OPEN') as active_markets,
                    (SELECT COUNT(*) FROM settlement_payouts WHERE payout_status = 'PENDING') as pending_payouts,
                    (SELECT COUNT(*) FROM local_users) as total_users,
                    (SELECT COUNT(*) FROM local_orders WHERE created_at >= NOW() - INTERVAL '24 hours') as trades_24h
            `);

            const activityRes = await client.query(`
                SELECT 
                    m.title, m.resolved_outcome, m.id,
                    ms.created_at, ms.resolved_by
                FROM market_settlements ms
                JOIN markets m ON m.id = ms.market_id
                ORDER BY ms.created_at DESC
                LIMIT 5
            `);

            const payload = {
                stats: statsRes.rows[0],
                recent_activity: activityRes.rows
            };

            return NextResponse.json(baseResponse(true, 'Fetched admin stats', payload), { status: 200 });
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
    }
}
