import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { baseResponse } from '@/lib/base_response';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: marketId } = await params;
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                created_at,
                price_at_order,
                outcome_type,
                order_type
            FROM local_orders
            WHERE market_id = $1
            ORDER BY created_at ASC
        `, [marketId]);

        const history = result.rows.map(row => ({
            time: row.created_at,
            price: parseFloat(row.price_at_order),
            outcome: row.outcome_type,
            type: row.order_type
        }));

        return NextResponse.json(
            baseResponse(true, "Successfully fetched market history", history),
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            baseResponse(false, error.message, null),
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
