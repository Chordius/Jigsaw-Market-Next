import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { loginUserService } from '@/services/auth.service';
import { createSession } from '@/lib/auth';
import { authRateLimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
    try {
        // Ekstrak IP Address untuk Rate Limiting
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        // Cek Rate Limit
        const { success } = await authRateLimit.limit(ip);
        if (!success) {
            return NextResponse.json(
                baseResponse(false, 'Too many login attempts. Please wait 1 minute before trying again.', null),
                { status: 429 }
            );
        }

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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login failed';
        console.error('Login Error:', message);
        return NextResponse.json(baseResponse(false, message, null), { status: 401 });
    }
}
