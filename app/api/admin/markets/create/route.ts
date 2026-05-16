import { NextResponse } from 'next/server';
import { createMarketService } from '@/services/market.service';
import { baseResponse } from '@/lib/base_response';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
             return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        // Check admin status
        const userCheck = await pool.query('SELECT is_admin FROM local_users WHERE id = $1', [session.user.id]);
        if (userCheck.rows.length === 0 || !userCheck.rows[0].is_admin) {
             return NextResponse.json(baseResponse(false, 'Forbidden', null), { status: 403 });
        }

        const body = await request.json();
        const { title, category, end_date, description } = body;

        if (!title || !category || !end_date) {
            return NextResponse.json(baseResponse(false, 'Missing required fields', null), { status: 400 });
        }

        const result = await createMarketService(title, category, end_date, description);

        return NextResponse.json(baseResponse(true, 'Market created successfully', result), { status: 201 });
    } catch (error: any) {
        return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
    }
}
