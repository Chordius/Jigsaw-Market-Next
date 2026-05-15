import { NextResponse } from 'next/server';
import { getMarketByIdService } from '@/services/market.service';
import { baseResponse } from '@/lib/base_response';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: marketId } = await params;
        const market = await getMarketByIdService(marketId);

        if (!market) {
            return NextResponse.json(
                baseResponse(false, "Market not found", null),
                { status: 404 }
            );
        }

        return NextResponse.json(
            baseResponse(true, "Successfully fetched market details", market),
            { status: 200 }
        );
    } catch (error: any) {
        console.error(`Error fetching market:`, error.message);
        return NextResponse.json(
            baseResponse(false, "Internal server error while fetching market details", null),
            { status: 500 }
        );
    }
}