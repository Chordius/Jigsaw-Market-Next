import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { pool } from '@/lib/db';
import { fetchCentralHistory } from '@/lib/jigsawcoin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const userRes = await pool.query(
      'SELECT central_user_id FROM local_users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(baseResponse(true, 'No coin history', []), { status: 200 });
    }

    const centralUserId = userRes.rows[0].central_user_id;

    let history: any[] = [];
    try {
      history = await fetchCentralHistory(centralUserId);
    } catch (coinErr: any) {
      console.warn('Could not fetch central history (Coin API may be offline):', coinErr.message);
    }

    return NextResponse.json(baseResponse(true, 'Coin history fetched', history));
  } catch (error: any) {
    console.error('Coin history error:', error.message);
    return NextResponse.json(baseResponse(false, error.message, null), { status: 500 });
  }
}
