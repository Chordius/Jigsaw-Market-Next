import { NextResponse } from 'next/server';
import { getOpenMarketsService } from '@/services/market.service';
import { baseResponse } from '@/lib/base_response';

export async function GET() {
    try {
        const markets = await getOpenMarketsService();
        
        return NextResponse.json(
            baseResponse(true, "Successfully fetched open markets", markets),
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching markets:', error.message);
        return NextResponse.json(
            baseResponse(false, "Internal server error while fetching markets", null),
            { status: 500 }
        );
    }
}