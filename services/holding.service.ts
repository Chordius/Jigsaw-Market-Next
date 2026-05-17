import { pool } from '@/lib/db';
import { calculatePrices } from '@/services/market.service';

export async function getUserHoldingsService(localUserId: string) {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                h.id AS holding_id,
                h.market_id,
                m.title AS market_title,
                CASE 
                    WHEN m.status = 'OPEN' AND m.end_date <= NOW() THEN 'CLOSED'
                    ELSE m.status
                END AS market_status,
                h.outcome_type,
                h.shares_amount,
                h.average_buy_price,
                h.local_user_id,
                m.liquidity_yes,
                m.liquidity_no
            FROM holdings h
            JOIN markets m ON h.market_id = m.id
            WHERE h.local_user_id = $1 AND h.shares_amount > 0
            ORDER BY m.created_at DESC
        `, [localUserId]
        );

        const portfolio = result.rows.map(row => {
            const prices = calculatePrices(row.liquidity_yes, row.liquidity_no);
            let currentPrice = 5.0;
            if (prices) {
                currentPrice = row.outcome_type === 'YES' ? prices.price_yes : prices.price_no;
            }

            const totalInvested = parseFloat(row.average_buy_price) * parseFloat(row.shares_amount);
            const currentValue = currentPrice * parseFloat(row.shares_amount);
            const unrealizedPnl = currentValue - totalInvested;

            return {
                holding_id: row.holding_id,
                market_id: row.market_id,
                market_title: row.market_title,
                market_status: row.market_status,
                outcome_type: row.outcome_type,
                shares_amount: parseFloat(row.shares_amount),
                average_buy_price: parseFloat(row.average_buy_price),
                current_price: currentPrice,
                unrealized_pnl: unrealizedPnl
            };
        });

        return portfolio;
    } finally {
        client.release();
    }
}