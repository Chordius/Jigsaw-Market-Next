import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { baseResponse } from '@/lib/base_response';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json(baseResponse(false, 'User ID is required', null), { status: 400 });
        }

        const result = await pool.query(`
            SELECT
                lo.id,
                lo.order_type,
                lo.outcome_type,
                lo.shares_amount,
                lo.price_at_order,
                lo.total_cost,
                lo.created_at,
                m.id   AS market_id,
                m.title AS market_title
            FROM local_orders lo
            JOIN markets m ON m.id = lo.market_id
            WHERE lo.local_user_id = $1
            ORDER BY lo.created_at DESC
            LIMIT 100
        `, [userId]);

        return NextResponse.json(baseResponse(true, 'Fetched order history', result.rows), { status: 200 });
    } catch (error: any) {
        return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
    }
}
