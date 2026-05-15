import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { pool } from '@/lib/db';
import { fetchCentralHistory } from '@/lib/jigsawcoin';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get central_user_id from local DB
    const userRes = await pool.query(
      'SELECT central_user_id FROM local_users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(baseResponse(false, 'User not found', null), { status: 404 });
    }

    const centralUserId = userRes.rows[0].central_user_id;
    const history = await fetchCentralHistory(centralUserId);

    return NextResponse.json(baseResponse(true, 'Coin history fetched', history));
  } catch (error: any) {
    console.error('Coin history error:', error.message);
    return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
  }
}
