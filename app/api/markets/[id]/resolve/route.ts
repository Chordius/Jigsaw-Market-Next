import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { resolveMarketService } from '@/services/market.service';

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const expectedResolverKey = process.env.MARKET_RESOLUTION_API_KEY;
        const providedResolverKey = request.headers.get('x-resolution-key');
        
        let isAuthorized = false;
        let resolverName = 'system';

        if (expectedResolverKey && providedResolverKey === expectedResolverKey) {
            isAuthorized = true;
            resolverName = request.headers.get('x-resolved-by') ?? 'external-api';
        }

        if (!isAuthorized) {
            const { getSession } = await import('@/lib/auth');
            const session = await getSession();
            if (session?.user) {
                const { pool } = await import('@/lib/db');
                const userCheck = await pool.query('SELECT username, is_admin FROM local_users WHERE id = $1', [session.user.id]);
                if (userCheck.rows.length > 0 && userCheck.rows[0].is_admin) {
                    isAuthorized = true;
                    resolverName = `Admin: ${userCheck.rows[0].username}`;
                }
            }
        }

        if (!isAuthorized) {
            return NextResponse.json(baseResponse(false, 'Unauthorized', null), { status: 401 });
        }

        const { id: marketId } = await params;
        const body = await request.json();
        const outcome = (body?.outcome ?? '').toUpperCase();

        if (!marketId) {
            return NextResponse.json(baseResponse(false, 'Market ID is required', null), { status: 400 });
        }

        if (outcome !== 'YES' && outcome !== 'NO') {
            return NextResponse.json(baseResponse(false, "Outcome must be 'YES' or 'NO'", null), { status: 400 });
        }

        const result = await resolveMarketService(marketId, outcome as 'YES' | 'NO', resolverName);

        return NextResponse.json(baseResponse(true, 'Market resolved', result), { status: 200 });
    } catch (error: unknown) {
        console.error('Error resolving market:', getErrorMessage(error));
        return NextResponse.json(baseResponse(false, 'Internal server error while resolving market', null), { status: 500 });
    }
}
