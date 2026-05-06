import { pool } from '@/lib/db';

// Helper function to calculate AMM Price
const calculatePrices = (liquidityYes: string, liquidityNo: string) => {
    const lYes = parseFloat(liquidityYes);
    const lNo = parseFloat(liquidityNo);
    const total = lYes + lNo;
    
    return {
        price_yes: total > 0 ? lYes / total : 0.5,
        price_no: total > 0 ? lNo / total : 0.5,
    };
};

export async function getOpenMarketsService() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, title, category, end_date, liquidity_yes, liquidity_no 
            FROM markets 
            WHERE status = 'OPEN' 
            ORDER BY created_at DESC
        `);

        // Map through and attach the dynamically calculated prices
        const markets = result.rows.map(market => ({
            id: market.id,
            title: market.title,
            category: market.category,
            end_date: market.end_date,
            ...calculatePrices(market.liquidity_yes, market.liquidity_no)
        }));

        return markets;
    } finally {
        client.release();
    }
}

export async function getMarketByIdService(marketId: string) {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, title, description, category, end_date, status, resolved_outcome, liquidity_yes, liquidity_no 
            FROM markets 
            WHERE id = $1
        `, [marketId]);

        if (result.rows.length === 0) return null;

        const market = result.rows[0];
        return {
            ...market,
            ...calculatePrices(market.liquidity_yes, market.liquidity_no)
        };
    } finally {
        client.release();
    }
}