import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { resolveMarketService } from '@/services/market.service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { marketId } = body;

        if (!marketId) {
            return NextResponse.json(baseResponse(false, 'marketId is required', null), { status: 400 });
        }

        // Randomize outcome for the automated resolution
        const outcome = Math.random() > 0.5 ? 'YES' : 'NO';

        const result = await resolveMarketService(marketId, outcome, 'Upstash QStash');

        return NextResponse.json(baseResponse(true, 'Market resolved successfully via QStash', result), { status: 200 });
    } catch (error: any) {
        console.error('Error resolving market via QStash:', error.message);
        return NextResponse.json(baseResponse(false, 'Internal server error while resolving market', null), { status: 500 });
    }
}
