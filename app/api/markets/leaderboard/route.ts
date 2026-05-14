import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { getMarketLeaderboardService } from '@/services/market.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitRaw = searchParams.get('limit');
        const statusParam = (searchParams.get('status') ?? '').toUpperCase();

        const parsedLimit = limitRaw ? Number.parseInt(limitRaw, 10) : 10;
        const limit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 10 : Math.min(parsedLimit, 100);

        const status = statusParam === 'OPEN' || statusParam === 'CLOSED' || statusParam === 'RESOLVED' || statusParam === 'ALL'
            ? statusParam
            : undefined;

        const leaderboard = await getMarketLeaderboardService({
            limit,
            status,
        });

        return NextResponse.json(
            baseResponse(true, 'Successfully fetched market leaderboard', leaderboard),
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching market leaderboard:', error.message);
        return NextResponse.json(
            baseResponse(false, 'Internal server error while fetching market leaderboard', null),
            { status: 500 }
        );
    }
}
