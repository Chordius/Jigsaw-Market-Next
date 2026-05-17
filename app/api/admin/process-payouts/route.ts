import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { processPendingSettlementPayouts } from '@/services/market.service';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        const client = await pool.connect();
        try {
            const userCheck = await client.query('SELECT is_admin FROM local_users WHERE id = $1', [session.user.id]);
            if (userCheck.rows.length === 0 || !userCheck.rows[0].is_admin) {
                return NextResponse.json(baseResponse(false, 'Forbidden: Admin access required', null), { status: 403 });
            }
        } finally {
            client.release();
        }

        const result = await processPendingSettlementPayouts(50);

        return NextResponse.json(
            baseResponse(true, 'Settlement payout processing triggered manually', result),
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in manual process payouts:', error.message);
        return NextResponse.json(
            baseResponse(false, 'Internal server error', null),
            { status: 500 }
        );
    }
}
