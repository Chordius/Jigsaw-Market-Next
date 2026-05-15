import { NextResponse } from 'next/server';
import { baseResponse } from '@/lib/base_response';
import { executeTrade, executeSellTrade } from '@/services/trade.services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { localUserId, centralUserId, marketId, outcomeType, sharesToBuy, sharesToSell, action } = body;

    const tradeAction = action || (sharesToSell ? 'SELL' : 'BUY');

    if (tradeAction === 'BUY') {
      if (!(localUserId && centralUserId && marketId && outcomeType && sharesToBuy)) {
        return NextResponse.json(baseResponse(false, 'Missing required fields for buy', null), { status: 400 });
      }
      const result = await executeTrade(localUserId, centralUserId, marketId, outcomeType, sharesToBuy);
      return NextResponse.json(baseResponse(true, 'Buy successfully executed', { newBalance: result.newBalance, orderId: result.orderId }), { status: 200 });
    } else {
      if (!(localUserId && centralUserId && marketId && outcomeType && sharesToSell)) {
        return NextResponse.json(baseResponse(false, 'Missing required fields for sell', null), { status: 400 });
      }
      const result = await executeSellTrade(localUserId, centralUserId, marketId, outcomeType, sharesToSell);
      return NextResponse.json(baseResponse(true, 'Sell successfully executed', { newBalance: result.newBalance, orderId: result.orderId }), { status: 200 });
    }
  } catch (error: any) {
    console.error('Trade API Error:', error.message);
    
    const status = error.message.includes('Insufficient balance') ? 402 : 500;
    
    return NextResponse.json(baseResponse(false, error.message, null), { status });
  }
}