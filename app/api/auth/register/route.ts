import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { registerUserService } from '@/services/auth.service';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
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