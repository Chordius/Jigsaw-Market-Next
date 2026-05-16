import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { baseResponse } from '@/lib/base_response';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        const result = await pool.query(`
            SELECT 
                sp.id,
                sp.payout_amount,
                sp.processed_at,
                sp.payout_status,
                m.title AS market_title,
                m.resolved_outcome
            FROM settlement_payouts sp
            JOIN markets m ON m.id = sp.market_id
            WHERE sp.local_user_id = $1 AND sp.payout_status = 'PAID'
            ORDER BY sp.processed_at DESC
            LIMIT 50
        `, [userId]);

        return NextResponse.json(baseResponse(true, 'Fetched payouts', result.rows), { status: 200 });
    } catch (error: any) {
        return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
    }
}
