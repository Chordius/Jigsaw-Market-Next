import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import {
    processPendingSettlementPayouts,
    requeueFailedSettlementPayouts,
} from '@/services/market.service';

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

        const body = await request.json().catch(() => ({} as Record<string, unknown>));

        const settlementId = typeof body.settlementId === 'string' ? body.settlementId : undefined;
        const marketId = typeof body.marketId === 'string' ? body.marketId : undefined;
        const payoutIds = Array.isArray(body.payoutIds)
            ? body.payoutIds.filter((id): id is string => typeof id === 'string')
            : undefined;

        const parsedLimit = Number.parseInt(String(body.limit ?? '100'), 10);
        const limit = Number.isNaN(parsedLimit) ? 100 : parsedLimit;

        const parsedMaxRetries = Number.parseInt(String(body.maxRetries ?? '5'), 10);
        const maxRetries = Number.isNaN(parsedMaxRetries) ? 5 : parsedMaxRetries;

        const processNow = typeof body.processNow === 'boolean' ? body.processNow : true;
        const parsedProcessLimit = Number.parseInt(String(body.processLimit ?? limit), 10);
        const processLimit = Number.isNaN(parsedProcessLimit) ? limit : parsedProcessLimit;

        const requeueResult = await requeueFailedSettlementPayouts({
            settlementId,
            marketId,
            payoutIds,
            limit,
            maxRetries,
        });

        let processResult = null;
        if (processNow && requeueResult.requeued > 0) {
            processResult = await processPendingSettlementPayouts(processLimit);
        }

        return NextResponse.json(
            baseResponse(true, 'Failed payouts requeued successfully', {
                requeue: requeueResult,
                process: processResult,
            }),
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error retrying settlement payouts:', getErrorMessage(error));
        return NextResponse.json(
            baseResponse(false, 'Internal server error while retrying settlement payouts', null),
            { status: 500 }
        );
    }
}
