import { NextResponse } from 'next/server';
import { createMarketService, getOpenMarketsService } from '@/services/market.service';
import { baseResponse } from '@/lib/base_response';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const sortByParam = (searchParams.get('sortBy') ?? '').toLowerCase();
        const orderParam = (searchParams.get('order') ?? '').toLowerCase();
        const statusParam = (searchParams.get('status') ?? '').toUpperCase();

        const sortBy = sortByParam === 'popularity' || sortByParam === 'ends_by' || sortByParam === 'created_at'
            ? sortByParam
            : undefined;
        const order = orderParam === 'asc' || orderParam === 'desc' ? orderParam : undefined;
        const status = statusParam === 'OPEN' || statusParam === 'CLOSED' || statusParam === 'RESOLVED' || statusParam === 'ALL'
            ? statusParam
            : undefined;

        const category = searchParams.get('category') ?? undefined;

        const markets = await getOpenMarketsService({
            sortBy,
            order,
            status,
            category,
        });
        
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, category, endDate, description } = body;

        if (!title || !category || !endDate) {
            return NextResponse.json(
                baseResponse(false, 'title, category, and endDate are required', null),
                { status: 400 }
            );
        }

        const parsedEndDate = new Date(endDate);
        if (Number.isNaN(parsedEndDate.getTime())) {
            return NextResponse.json(
                baseResponse(false, 'endDate must be a valid date', null),
                { status: 400 }
            );
        }

        const newMarket = await createMarketService(
            String(title).trim(),
            String(category).trim(),
            parsedEndDate.toISOString(),
            typeof description === 'string' ? description.trim() : undefined
        );

        // TODO (Rasya): Buat scheduler menggunakan upstash Redis or anything along those lines
        // biar kita bisa nge-trigger market/[id]/resolve nantinya.

        return NextResponse.json(
            baseResponse(true, 'Market created successfully', newMarket),
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating market:', error.message);
        return NextResponse.json(
            baseResponse(false, 'Internal server error while creating market', null),
            { status: 500 }
        );
    }
}