import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { processPendingSettlementPayouts } from '@/services/market.service';

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request) {
    try {
        const expectedWorkerKey = process.env.MARKET_RESOLUTION_API_KEY;
        const providedWorkerKey = request.headers.get('x-resolution-key');

        if (!expectedWorkerKey || providedWorkerKey !== expectedWorkerKey) {
            return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const limitRaw = body?.limit;
        const parsedLimit = Number.parseInt(String(limitRaw ?? '50'), 10);
        const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit;

        const result = await processPendingSettlementPayouts(limit);

        return NextResponse.json(
            baseResponse(true, 'Settlement payout processing complete', result),
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error processing settlement payouts:', getErrorMessage(error));
        return NextResponse.json(
            baseResponse(false, 'Internal server error while processing settlement payouts', null),
            { status: 500 }
        );
    }
}
