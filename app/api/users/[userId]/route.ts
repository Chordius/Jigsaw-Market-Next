import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { getUserProfileService } from '@/services/user.service';
import { getSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json(
                baseResponse(false, 'User ID is required', null),
                { status: 400 }
            );
        }

        const userProfile = await getUserProfileService(userId);
        
        const session = await getSession();
        // Redact sensitive info if user is not viewing their own profile
        if (!session || (!session.user.is_admin && session.user.id !== userId)) {
            userProfile.email = undefined; // Or delete userProfile.email
        }

        return NextResponse.json(
            baseResponse(true, 'Successfully fetched user profile', userProfile),
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        if (errorMessage === 'User not found') {
            return NextResponse.json(
                baseResponse(false, 'User not found', null),
                { status: 404 }
            );
        }

        return NextResponse.json(
            baseResponse(false, errorMessage, null),
            { status: 500 }
        );
    }
}
