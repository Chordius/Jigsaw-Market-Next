import { pool } from '@/lib/db';

type MarketStatus = 'OPEN' | 'CLOSED' | 'RESOLVED';
type MarketSortBy = 'created_at' | 'popularity' | 'ends_by';
type SortOrder = 'asc' | 'desc';

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

const mapMarketWithPrices = (market: {
    id: string;
    title: string;
    category: string;
    end_date: string;
    liquidity_yes: string;
    liquidity_no: string;
    investor_count?: string | number;
    total_invested?: string;
    status?: MarketStatus;
    description?: string | null;
    resolved_outcome?: 'YES' | 'NO' | null;
}) => ({
    id: market.id,
    title: market.title,
    category: market.category,
    end_date: market.end_date,
    status: market.status,
    description: market.description,
    resolved_outcome: market.resolved_outcome,
    investor_count: Number(market.investor_count ?? 0),
    total_invested: parseFloat(market.total_invested ?? '0'),
    ...calculatePrices(market.liquidity_yes, market.liquidity_no),
});

export async function getOpenMarketsService(options?: {
    sortBy?: MarketSortBy;
    order?: SortOrder;
    category?: string;
    status?: MarketStatus | 'ALL';
}) {
    const client = await pool.connect();
    try {
        const sortBy = options?.sortBy ?? 'created_at';
        const order = options?.order ?? 'desc';
        const category = options?.category?.trim() || null;
        const status = options?.status ?? 'OPEN';

        const sortColumn = sortBy === 'popularity'
            ? 'investor_count'
            : sortBy === 'ends_by'
                ? 'm.end_date'
                : 'm.created_at';
        const sortDirection = order === 'asc' ? 'ASC' : 'DESC';

        const result = await client.query(`
            SELECT 
                m.id,
                m.title,
                m.category,
                m.end_date,
                m.status,
                m.description,
                m.resolved_outcome,
                m.liquidity_yes,
                m.liquidity_no,
                COUNT(DISTINCT lo.local_user_id) FILTER (WHERE lo.order_type = 'BUY') AS investor_count,
                COALESCE(SUM(lo.total_cost) FILTER (WHERE lo.order_type = 'BUY'), 0) AS total_invested
            FROM markets m
            LEFT JOIN local_orders lo ON lo.market_id = m.id
            WHERE ($1::text IS NULL OR m.status = $1)
            AND ($2::text IS NULL OR m.category = $2)
            GROUP BY m.id
            ORDER BY ${sortColumn} ${sortDirection}, m.created_at DESC
        `, [status === 'ALL' ? null : status, category]);

        const markets = result.rows.map(mapMarketWithPrices);

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

        return mapMarketWithPrices(result.rows[0]);
    } finally {
        client.release();
    }
}

export async function createMarketService(
    title: string,
    category: string,
    endDate: string,
    description?: string
) {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            INSERT INTO markets (title, category, end_date, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, category, end_date, status, description, resolved_outcome, liquidity_yes, liquidity_no
        `, [title, category, endDate, description ?? null]);

        return mapMarketWithPrices(result.rows[0]);
    } finally {
        client.release();
    }
}

export async function getMarketLeaderboardService(options?: {
    limit?: number;
    status?: MarketStatus | 'ALL';
}) {
    const client = await pool.connect();
    try {
        const limit = options?.limit ?? 10;
        const status = options?.status ?? 'OPEN';

        const result = await client.query(`
            SELECT 
                m.id,
                m.title,
                m.category,
                m.end_date,
                m.status,
                m.description,
                m.resolved_outcome,
                m.liquidity_yes,
                m.liquidity_no,
                COUNT(DISTINCT lo.local_user_id) FILTER (WHERE lo.order_type = 'BUY') AS investor_count,
                COALESCE(SUM(lo.total_cost) FILTER (WHERE lo.order_type = 'BUY'), 0) AS total_invested
            FROM markets m
            LEFT JOIN local_orders lo ON lo.market_id = m.id
            WHERE ($1::text IS NULL OR m.status = $1)
            GROUP BY m.id
            ORDER BY total_invested DESC, investor_count DESC, m.created_at DESC
            LIMIT $2
        `, [status === 'ALL' ? null : status, limit]);

        return result.rows.map(mapMarketWithPrices);
    } finally {
        client.release();
    }
}