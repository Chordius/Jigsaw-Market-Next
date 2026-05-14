import { pool } from '@/lib/db';

export async function getUserTradingLeaderboardService(limit = 20) {
    const client = await pool.connect();
    const safeLimit = Math.max(1, Math.min(limit, 200));

    try {
        const result = await client.query(
            `WITH trade_summary AS (
                SELECT
                    lo.local_user_id,
                    COUNT(*) AS total_trades,
                    COALESCE(SUM(CASE WHEN lo.order_type = 'BUY' THEN lo.total_cost ELSE 0 END), 0) AS total_buy_cost,
                    COALESCE(SUM(CASE WHEN lo.order_type = 'SELL' THEN lo.total_cost ELSE 0 END), 0) AS total_sell_value,
                    COALESCE(SUM(CASE WHEN lo.order_type = 'SELL' THEN lo.total_cost ELSE -lo.total_cost END), 0) AS net_trade_cashflow
                FROM local_orders lo
                GROUP BY lo.local_user_id
            ),
            position_summary AS (
                SELECT
                    h.local_user_id,
                    COALESCE(SUM(
                        h.shares_amount *
                        CASE
                            WHEN (m.liquidity_yes + m.liquidity_no) > 0 THEN
                                CASE
                                    WHEN h.outcome_type = 'YES' THEN m.liquidity_yes / (m.liquidity_yes + m.liquidity_no)
                                    ELSE m.liquidity_no / (m.liquidity_yes + m.liquidity_no)
                                END
                            ELSE 0.5
                        END
                    ), 0) AS current_position_value
                FROM holdings h
                JOIN markets m ON m.id = h.market_id
                WHERE h.shares_amount > 0
                GROUP BY h.local_user_id
            ),
            payout_summary AS (
                SELECT
                    sp.local_user_id,
                    COALESCE(SUM(sp.payout_amount), 0) AS total_paid_payouts
                FROM settlement_payouts sp
                WHERE sp.payout_status = 'PAID'
                GROUP BY sp.local_user_id
            )
            SELECT
                lu.id AS local_user_id,
                lu.username,
                COALESCE(ts.total_trades, 0) AS total_trades,
                COALESCE(ts.total_buy_cost, 0) AS total_buy_cost,
                COALESCE(ts.total_sell_value, 0) AS total_sell_value,
                COALESCE(ts.net_trade_cashflow, 0) AS net_trade_cashflow,
                COALESCE(ps.current_position_value, 0) AS current_position_value,
                COALESCE(py.total_paid_payouts, 0) AS total_paid_payouts,
                (
                    COALESCE(ts.net_trade_cashflow, 0) +
                    COALESCE(ps.current_position_value, 0) +
                    COALESCE(py.total_paid_payouts, 0)
                ) AS total_surplus
            FROM local_users lu
            LEFT JOIN trade_summary ts ON ts.local_user_id = lu.id
            LEFT JOIN position_summary ps ON ps.local_user_id = lu.id
            LEFT JOIN payout_summary py ON py.local_user_id = lu.id
            ORDER BY total_surplus DESC, lu.created_at ASC
            LIMIT $1`,
            [safeLimit]
        );

        return result.rows.map((row, index) => ({
            rank: index + 1,
            local_user_id: row.local_user_id,
            username: row.username,
            total_trades: Number(row.total_trades),
            total_buy_cost: parseFloat(row.total_buy_cost),
            total_sell_value: parseFloat(row.total_sell_value),
            net_trade_cashflow: parseFloat(row.net_trade_cashflow),
            current_position_value: parseFloat(row.current_position_value),
            total_paid_payouts: parseFloat(row.total_paid_payouts),
            total_surplus: parseFloat(row.total_surplus),
        }));
    } finally {
        client.release();
    }
}
