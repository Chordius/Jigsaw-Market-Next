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

        // Pattern Cache-Aside Redis
        const cacheKey = `cache:user-leaderboard:${limit}`;
        let leaderboard = await redis.get(cacheKey);

        if (!leaderboard) {
            leaderboard = await getUserTradingLeaderboardService(limit);
            // Simpan ke cahe selama 5 menite (300 detik)
            await redis.set(cacheKey, JSON.stringify(leaderboard), { ex: 300 });
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
