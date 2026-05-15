import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { baseResponse } from '@/lib/base_response';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(baseResponse(false, 'No active session', null), { status: 401 });
    }
    return NextResponse.json(baseResponse(true, 'Session active', { user: session.user }), { status: 200 });
  } catch (error) {
    return NextResponse.json(baseResponse(false, 'Failed to fetch session', null), { status: 500 });
  }
}
