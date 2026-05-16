import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { tradeRateLimit } from '@/lib/ratelimit';
import { executeTrade, executeSellTrade } from '@/services/trade.services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { localUserId, centralUserId, marketId, outcomeType, sharesToBuy, sharesToSell, action } = body;

    // Cek Rate Limit per Akun (hindari spam transaksi)
    if (localUserId) {
      const { success } = await tradeRateLimit.limit(localUserId);
      if (!success) {
        return NextResponse.json(
          baseResponse(false, 'Too many requests. Please wait before making another transaction.', null),
          { status: 429 }
        );
      }
    }

    const tradeAction = String(action || (sharesToSell ? 'SELL' : 'BUY')).toUpperCase();

    if (tradeAction === 'BUY') {
      if (!(localUserId && centralUserId && marketId && outcomeType && sharesToBuy)) {
        return NextResponse.json(baseResponse(false, 'Missing required fields for buy', null), { status: 400 });
      }

      const result = await executeTrade(localUserId, centralUserId, marketId, outcomeType, sharesToBuy);
      return NextResponse.json(baseResponse(true, 'Buy successfully executed', { newBalance: result.newBalance, orderId: result.orderId }), { status: 200 });
    }

    if (tradeAction === 'SELL') {
      if (!(localUserId && centralUserId && marketId && outcomeType && sharesToSell)) {
        return NextResponse.json(baseResponse(false, 'Missing required fields for sell', null), { status: 400 });
      }

      const result = await executeSellTrade(localUserId, centralUserId, marketId, outcomeType, sharesToSell);
      return NextResponse.json(baseResponse(true, 'Sell successfully executed', { newBalance: result.newBalance, orderId: result.orderId }), { status: 200 });
    }

    return NextResponse.json(baseResponse(false, 'Invalid trade action', null), { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Trade request failed';
    console.error('Trade API Error:', message);

    const status = message.includes('Insufficient balance') ? 402 : 500;

    return NextResponse.json(baseResponse(false, message, null), { status });
  }
}
