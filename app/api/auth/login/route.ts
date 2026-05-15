import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { loginUserService } from '@/services/auth.service';
import { createSession } from '@/lib/auth';
import { fetchCentralHistory, creditCentralPoints } from '@/lib/jigsawcoin';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(baseResponse(false, 'Missing credentials', null), { status: 400 });
        }

        const user = await loginUserService(email, password);
        
        await createSession({
            id: user.id,
            central_user_id: user.central_user_id,
            username: user.username,
            email: email
        });

        return NextResponse.json(baseResponse(true, 'Login successful', { user }), { status: 200 });
    } catch (error: any) {
        console.error('Login Error:', error.message);
        return NextResponse.json(baseResponse(false, error.message, null), { status: 401 });
    }
}