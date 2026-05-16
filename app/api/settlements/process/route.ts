import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { processPendingSettlementPayouts } from '@/services/market.service';
import { Receiver } from '@upstash/qstash';

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request) {
    try {
        const signature = request.headers.get('upstash-signature');
        
        if (!process.env.QSTASH_CURRENT_SIGNING_KEY) {
            // Fallback for local dev if qstash is not configured yet, but require market resolution key for testing
            const expectedWorkerKey = process.env.MARKET_RESOLUTION_API_KEY;
            const providedWorkerKey = request.headers.get('x-resolution-key');
            if (!expectedWorkerKey || providedWorkerKey !== expectedWorkerKey) {
                 return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
            }
        } else {
            // Ensure QStash Signature is valid
            if (!signature) {
                return NextResponse.json(baseResponse(false, 'Missing QStash Signature', null), { status: 401 });
            }
            const bodyText = await request.clone().text();
            
            const isValid = await receiver.verify({
                signature: signature,
                body: bodyText,
            });

            if (!isValid) {
                return NextResponse.json(baseResponse(false, 'Invalid QStash Signature', null), { status: 401 });
            }
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
