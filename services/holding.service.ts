import { pool } from '@/lib/db';

export async function getUserHoldingsService(localUserId: string) {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                h.id AS holding_id,
                h.market_id,
                m.title AS market_title,
                m.status AS market_status,
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
            const lYes = parseFloat(row.liquidity_yes);
            const lNo = parseFloat(row.liquidity_no);
            const totalLiquidity = lYes + lNo;
            
            let currentPrice = 5.0;
            if (totalLiquidity > 0) {
                currentPrice = row.outcome_type === 'YES' 
                    ? (lYes / totalLiquidity) * 10
                    : (lNo / totalLiquidity) * 10;
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