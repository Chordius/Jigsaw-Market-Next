import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { getUserTradingLeaderboardService } from '@/services/user_leaderboard.service';
import { redis } from '@/lib/redis';

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parsedLimit = Number.parseInt(searchParams.get('limit') ?? '20', 10);
        const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit;

        const cacheKey = `leaderboard_top_${limit}`;
        
        try {
            const cachedLeaderboard = await redis.get(cacheKey);
            if (cachedLeaderboard) {
                return NextResponse.json(
                    baseResponse(true, 'Successfully fetched user trading leaderboard', cachedLeaderboard),
                    { status: 200 }
                );
            }
        } catch (redisError) {
            console.warn('Redis cache miss or error:', redisError);
        }

        const leaderboard = await getUserTradingLeaderboardService(limit);

        try {
            await redis.set(cacheKey, leaderboard, { ex: 300 }); // Cache for 5 minutes
        } catch (redisError) {
            console.warn('Could not set Redis cache:', redisError);
        }

        return NextResponse.json(
            baseResponse(true, 'Successfully fetched user trading leaderboard', leaderboard),
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error fetching user trading leaderboard:', getErrorMessage(error));
        return NextResponse.json(
            baseResponse(false, 'Internal server error while fetching user trading leaderboard', null),
            { status: 500 }
        );
    }
}
