import { pool } from '@/lib/db';
import { deductCentralPoints } from '@/lib/jigsawcoin';
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
            'SELECT liquidity_yes, liquidity_no FROM markets WHERE id = $1 FOR UPDATE',
            [marketId]
        );

        if (marketRes.rows.length === 0) {
            throw new Error('Market not found');
        }

        const { liquidity_yes, liquidity_no } = marketRes.rows[0];
        const lYes = parseFloat(liquidity_yes);
        const lNo = parseFloat(liquidity_no);
        
        var pricePerShare;
        if (outcomeType === 'YES') {
            pricePerShare = lYes / (lYes + lNo);
        } else {
            pricePerShare = lNo / (lYes + lNo);
        }
        
        const totalCost = pricePerShare * sharesToBuy;
        const localOrderId = uuidv4();

        const centralResponse = await deductCentralPoints(centralUserId, totalCost, localOrderId);
        const centralTransactionId = centralResponse.global_transaction_id;

        await client.query(
            `INSERT INTO local_orders 
            (id, local_user_id, market_id, order_type, outcome_type, total_cost, central_transaction_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [localOrderId, localUserId, marketId, 'BUY', outcomeType, totalCost, centralTransactionId]
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

        const newLYes = outcomeType === 'YES' ? lYes + totalCost : lYes;
        const newLNo = outcomeType === 'NO' ? lNo + totalCost : lNo;
        
        await client.query(
            'UPDATE markets SET liquidity_yes = $1, liquidity_no = $2 WHERE id = $3',
            [newLYes, newLNo, marketId]
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