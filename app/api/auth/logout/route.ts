import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { baseResponse } from '@/lib/base_response';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json(baseResponse(true, 'Logged out successfully', null), { status: 200 });
  } catch (error) {
    return NextResponse.json(baseResponse(false, 'Failed to logout', null), { status: 500 });
  }
}
