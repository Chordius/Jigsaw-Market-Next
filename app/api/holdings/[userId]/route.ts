import { NextResponse } from 'next/server';
import { getUserHoldingsService } from '@/services/holding.service';
import { baseResponse } from '@/lib/base_response';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    const resolvedParams = await params;
    const localUserId = resolvedParams.userId;
    try {
        if (!localUserId) {
            return NextResponse.json(
                baseResponse(false, "User ID is required", null),
                { status: 400 }
            );
        }

        const portfolio = await getUserHoldingsService(localUserId);

        return NextResponse.json(
            baseResponse(true, "Successfully fetched user portfolio", portfolio),
            { status: 200 }
        );
    } catch (error: any) {
        console.error(`Error fetching holdings for user ${localUserId}:`, error.message);
        
        return NextResponse.json(
            baseResponse(false, "Internal server error while fetching portfolio", null),
            { status: 500 }
        );
    }
}