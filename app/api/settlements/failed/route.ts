import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { listFailedSettlementPayouts } from '@/services/market.service';

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request) {
    try {
        const expectedWorkerKey = process.env.MARKET_RESOLUTION_API_KEY;
        const providedWorkerKey = request.headers.get('x-resolution-key');

        if (!expectedWorkerKey || providedWorkerKey !== expectedWorkerKey) {
            return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const settlementId = searchParams.get('settlementId') ?? undefined;
        const marketId = searchParams.get('marketId') ?? undefined;

        const parsedLimit = Number.parseInt(searchParams.get('limit') ?? '100', 10);
        const limit = Number.isNaN(parsedLimit) ? 100 : parsedLimit;

        const failedPayouts = await listFailedSettlementPayouts({
            settlementId,
            marketId,
            limit,
        });

        return NextResponse.json(
            baseResponse(true, 'Successfully fetched failed settlement payouts', {
                count: failedPayouts.length,
                items: failedPayouts,
            }),
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error fetching failed settlement payouts:', getErrorMessage(error));
        return NextResponse.json(
            baseResponse(false, 'Internal server error while fetching failed settlement payouts', null),
            { status: 500 }
        );
    }
}
