import { pool } from '@/lib/db';
import { deductCentralPoints, creditCentralPoints } from '@/lib/jigsawcoin';
import { redis } from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

export async function executeTrade(
    localUserId: string, 
    centralUserId: string, 
    marketId: string, 
    outcomeType: 'YES' | 'NO', 
    sharesToBuy: number
) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const marketRes = await client.query(
            'SELECT liquidity_yes, liquidity_no, end_date, status FROM markets WHERE id = $1 FOR UPDATE',
            [marketId]
        );

        if (marketRes.rows.length === 0) {
            throw new Error('Market not found');
        }

        const market = marketRes.rows[0];
        
        if (market.status !== 'OPEN') {
            throw new Error('Trading is closed for this market');
        }
        if (new Date(market.end_date) < new Date()) {
            throw new Error('This market has expired');
        }

        const { liquidity_yes, liquidity_no } = market;
        const qYes = parseFloat(liquidity_yes);
        const qNo = parseFloat(liquidity_no);
        
        const b = 100;

        const lmsrCost = (q1: number, q2: number, currentB: number) => {
            const max = Math.max(q1, q2);
            return max + currentB * Math.log(Math.exp((q1 - max) / currentB) + Math.exp((q2 - max) / currentB));
        };

        const costBefore = lmsrCost(qYes, qNo, b);
        const costAfter = outcomeType === 'YES' 
            ? lmsrCost(qYes + sharesToBuy, qNo, b)
            : lmsrCost(qYes, qNo + sharesToBuy, b);
        
        const totalCost = (costAfter - costBefore) * 10;
        const pricePerShare = totalCost / sharesToBuy;

        const localOrderId = uuidv4();
        const centralResponse = await deductCentralPoints(centralUserId, totalCost, localOrderId);
        const centralTransactionId = centralResponse.global_transaction_id;

        await client.query(
            `INSERT INTO local_orders 
            (id, local_user_id, market_id, order_type, outcome_type, total_cost, central_transaction_id, shares_amount, price_at_order) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [localOrderId, localUserId, marketId, 'BUY', outcomeType, totalCost, centralTransactionId, sharesToBuy, pricePerShare]
        );

        await client.query(`
            INSERT INTO holdings (local_user_id, market_id, outcome_type, shares_amount, average_buy_price)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (local_user_id, market_id, outcome_type) 
            DO UPDATE SET 
                shares_amount = holdings.shares_amount + EXCLUDED.shares_amount,
                average_buy_price = ((holdings.shares_amount * holdings.average_buy_price) + (EXCLUDED.shares_amount * EXCLUDED.average_buy_price)) / (holdings.shares_amount + EXCLUDED.shares_amount)
            `, [localUserId, marketId, outcomeType, sharesToBuy, pricePerShare]
        );

        const newQYes = outcomeType === 'YES' ? qYes + sharesToBuy : qYes;
        const newQNo = outcomeType === 'NO' ? qNo + sharesToBuy : qNo;
        
        await client.query(
            'UPDATE markets SET liquidity_yes = $1, liquidity_no = $2 WHERE id = $3',
            [newQYes, newQNo, marketId]
        );

        await client.query('COMMIT');
        return { newBalance: centralResponse.new_balance, orderId: localOrderId };
    } catch (error: any) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function executeSellTrade(
    localUserId: string, 
    centralUserId: string, 
    marketId: string, 
    outcomeType: 'YES' | 'NO', 
    sharesToSell: number
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const marketRes = await client.query('SELECT liquidity_yes, liquidity_no, end_date, status FROM markets WHERE id = $1 FOR UPDATE', [marketId]);
        if (marketRes.rows.length === 0) throw new Error('Market not found');
        
        const market = marketRes.rows[0];
        
        if (market.status !== 'OPEN') {
            throw new Error('Trading is closed for this market');
        }
        if (new Date(market.end_date) < new Date()) {
            throw new Error('This market has expired');
        }

        const { liquidity_yes, liquidity_no } = market;
        const qYes = parseFloat(liquidity_yes);
        const qNo = parseFloat(liquidity_no);
        
        const b = 100;

        const lmsrCost = (q1: number, q2: number, currentB: number) => {
            const max = Math.max(q1, q2);
            return max + currentB * Math.log(Math.exp((q1 - max) / currentB) + Math.exp((q2 - max) / currentB));
        };

        const costBefore = lmsrCost(qYes, qNo, b);
        const costAfter = outcomeType === 'YES' 
            ? lmsrCost(qYes - sharesToSell, qNo, b)
            : lmsrCost(qYes, qNo - sharesToSell, b);
        
        const totalRevenue = (costBefore - costAfter) * 10;
        const pricePerShare = totalRevenue / sharesToSell;
        
        const holdingsRes = await client.query('SELECT shares_amount FROM holdings WHERE local_user_id = $1 AND market_id = $2 AND outcome_type = $3 FOR UPDATE', [localUserId, marketId, outcomeType]);
        if (holdingsRes.rows.length === 0 || parseFloat(holdingsRes.rows[0].shares_amount) < sharesToSell) throw new Error('Insufficient shares to sell');
        
        const localOrderId = uuidv4();
        const centralResponse = await creditCentralPoints(centralUserId, totalRevenue, localOrderId);
        const centralTransactionId = centralResponse.global_transaction_id;
        
        await client.query('INSERT INTO local_orders (id, local_user_id, market_id, order_type, outcome_type, total_cost, central_transaction_id, shares_amount, price_at_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [localOrderId, localUserId, marketId, 'SELL', outcomeType, totalRevenue, centralTransactionId, sharesToSell, pricePerShare]);
        await client.query('UPDATE holdings SET shares_amount = shares_amount - $1 WHERE local_user_id = $2 AND market_id = $3 AND outcome_type = $4', [sharesToSell, localUserId, marketId, outcomeType]);
        
        const newQYes = outcomeType === 'YES' ? qYes - sharesToSell : qYes;
        const newQNo = outcomeType === 'NO' ? qNo - sharesToSell : qNo;
        await client.query('UPDATE markets SET liquidity_yes = $1, liquidity_no = $2 WHERE id = $3', [newQYes, newQNo, marketId]);
        
        await client.query('COMMIT');
        return { newBalance: centralResponse.new_balance, orderId: localOrderId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
