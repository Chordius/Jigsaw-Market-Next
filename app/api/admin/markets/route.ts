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

            const result = await client.query(`
                SELECT 
                    m.id, m.title, m.category, m.end_date, m.status, m.resolved_outcome,
                    m.liquidity_yes, m.liquidity_no,
                    (SELECT COUNT(*) FROM holdings WHERE market_id = m.id AND shares_amount > 0) as active_traders
                FROM markets m
                ORDER BY m.created_at DESC
            `);

            return NextResponse.json(baseResponse(true, 'Fetched all markets', result.rows), { status: 200 });
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
    }
}
