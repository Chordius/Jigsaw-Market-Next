import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { registerUserService } from '@/services/auth.service';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(baseResponse(false, 'Missing required fields', null), { status: 400 });
        }

        const newUser = await registerUserService(username, email, password);
        return NextResponse.json(baseResponse(true, 'Registration successful', { user: newUser }), { status: 201 });
    } catch (error: any) {
        console.error('Registration Error:', error.message);
        return NextResponse.json(baseResponse(false, error.message, null), { status: 400 });
    }
}