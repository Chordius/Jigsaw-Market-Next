import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { executeTrade } from '@/services/trade.services';
import { tradeRateLimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { localUserId, centralUserId, marketId, outcomeType, sharesToBuy } = body;

    // Cek Rate Limit per Akun (hindari spam transaksi)
    if (localUserId) {
        const { success } = await tradeRateLimit.limit(localUserId);
        if (!success) {
            return NextResponse.json(
                baseResponse(false, 'Terlalu banyak request. Harap tunggu sebentar sebelum beli lagi.', null), 
                { status: 429 } // 429 Too Many Requests
            );
        }
    }

    if (!(localUserId && centralUserId && marketId && outcomeType && sharesToBuy)) {
      return NextResponse.json(baseResponse(false, 'Missing required fields', null), { status: 400 });
    }

    const result = await executeTrade(localUserId, centralUserId, marketId, outcomeType, sharesToBuy);

    return NextResponse.json(baseResponse(
      true, 
      'Data successfully sent', 
      { 
          newBalance: result.newBalance,
          orderId: result.orderId
      }), 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Trade API Error:', error.message);
    
    // Determine HTTP status based on the error thrown by the service
    const status = error.message.includes('Insufficient balance') ? 402 : 500;
    
    // 4. Return formatted error response
    return NextResponse.json(baseResponse(false, error.message, null), { status });
  }
}