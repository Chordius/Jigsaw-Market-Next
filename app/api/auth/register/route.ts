import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { registerUserService } from '@/services/auth.service';
import { createSession } from '@/lib/auth';
import { authRateLimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
        const { success } = await authRateLimit.limit(ip);
        
        if (!success) {
            return NextResponse.json(baseResponse(false, 'Too many registration attempts. Please try again later.', null), { status: 429 });
        }

        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(baseResponse(false, 'Missing required fields', null), { status: 400 });
        }

        const newUser = await registerUserService(username, email, password);
        
        await createSession({
            id: newUser.id,
            central_user_id: newUser.central_user_id,
            username: newUser.username,
            email: newUser.email
        });

        return NextResponse.json(baseResponse(true, 'Registration successful', { user: newUser }), { status: 201 });
    } catch (error: any) {
        console.error('Registration Error:', error.message);
        return NextResponse.json(baseResponse(false, error.message, null), { status: 400 });
    }
}