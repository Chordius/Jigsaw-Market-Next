import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { resolveMarketService } from '@/services/market.service';

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const expectedResolverKey = process.env.MARKET_RESOLUTION_API_KEY;
        const providedResolverKey = request.headers.get('x-resolution-key');
        if (!expectedResolverKey || providedResolverKey !== expectedResolverKey) {
            return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        const resolvedParams = await params;
        const marketId = resolvedParams.id;
        const body = await request.json();
        const outcome = (body?.outcome ?? '').toUpperCase();

        if (!marketId) {
            return NextResponse.json(baseResponse(false, 'Market ID is required', null), { status: 400 });
        }

        if (outcome !== 'YES' && outcome !== 'NO') {
            return NextResponse.json(baseResponse(false, "Outcome must be 'YES' or 'NO'", null), { status: 400 });
        }

        const resolverName = request.headers.get('x-resolved-by') ?? 'system';
        const result = await resolveMarketService(marketId, outcome as 'YES' | 'NO', resolverName);

        return NextResponse.json(baseResponse(true, 'Market resolved', result), { status: 200 });
    } catch (error: unknown) {
        console.error('Error resolving market:', getErrorMessage(error));
        return NextResponse.json(baseResponse(false, 'Internal server error while resolving market', null), { status: 500 });
    }
}
