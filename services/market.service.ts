import { pool } from '@/lib/db';
import { creditCentralPoints } from '@/lib/jigsawcoin';

type MarketStatus = 'OPEN' | 'CLOSED' | 'RESOLVED';
type MarketSortBy = 'created_at' | 'popularity' | 'ends_by';
type SortOrder = 'asc' | 'desc';
type SettlementStatus = 'PENDING_PAYOUT' | 'COMPLETED' | 'PARTIAL_FAILED';

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

// Helper function to calculate AMM Price
const calculatePrices = (liquidityYes: string, liquidityNo: string) => {
    const qYes = parseFloat(liquidityYes);
    const qNo = parseFloat(liquidityNo);
    
    const b = 100;
    
    const priceYes = 10 * (1 / (1 + Math.exp((qNo - qYes) / b)));
    const priceNo = 10 - priceYes;
    
    return {
        price_yes: priceYes,
        price_no: priceNo,
        liquidity_b: b
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
    liquidity_yes: market.liquidity_yes,
    liquidity_no: market.liquidity_no,
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
                (SELECT COUNT(DISTINCT local_user_id) FROM holdings WHERE market_id = m.id AND shares_amount > 0) AS investor_count,
                (
                    COALESCE((SELECT SUM(total_cost) FROM local_orders WHERE market_id = m.id AND order_type = 'BUY'), 0) -
                    COALESCE((SELECT SUM(total_cost) FROM local_orders WHERE market_id = m.id AND order_type = 'SELL'), 0)
                ) AS total_invested
            FROM markets m
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
            SELECT 
                m.id,
                m.title,
                m.description,
                m.category,
                m.end_date,
                m.status,
                m.resolved_outcome,
                m.liquidity_yes,
                m.liquidity_no,
                (SELECT COUNT(DISTINCT local_user_id) FROM holdings WHERE market_id = m.id AND shares_amount > 0) AS investor_count,
                (
                    COALESCE((SELECT SUM(total_cost) FROM local_orders WHERE market_id = m.id AND order_type = 'BUY'), 0) -
                    COALESCE((SELECT SUM(total_cost) FROM local_orders WHERE market_id = m.id AND order_type = 'SELL'), 0)
                ) AS total_invested
            FROM markets m
            WHERE m.id = $1
            GROUP BY m.id
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
            INSERT INTO markets (title, category, end_date, description, liquidity_yes, liquidity_no)
            VALUES ($1, $2, $3, $4, 5.00, 5.00)
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

export async function resolveMarketService(
    marketId: string,
    outcome: 'YES' | 'NO',
    resolvedBy?: string
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const marketRes = await client.query(
            'SELECT id, status, resolved_outcome FROM markets WHERE id = $1 FOR UPDATE',
            [marketId]
        );

        if (marketRes.rows.length === 0) throw new Error('Market not found');

        const market = marketRes.rows[0];
        if (market.status === 'RESOLVED') {
            if (market.resolved_outcome === outcome) {
                await client.query('COMMIT');
                return { message: 'Market already resolved with same outcome' };
            }
            throw new Error('Market already resolved with a different outcome');
        }

        await client.query(
            'UPDATE markets SET status = $1, resolved_outcome = $2 WHERE id = $3',
            ['RESOLVED', outcome, marketId]
        );

        const settlementInsertRes = await client.query(
            `INSERT INTO market_settlements (market_id, resolved_outcome, status, resolved_by)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [marketId, outcome, 'PENDING_PAYOUT', resolvedBy ?? null]
        );
        const settlementId: string = settlementInsertRes.rows[0].id;

        const winnersRes = await client.query(
            `SELECT h.id AS holding_id, h.local_user_id, h.shares_amount, lu.central_user_id
             FROM holdings h
             JOIN local_users lu ON lu.id = h.local_user_id
             WHERE h.market_id = $1 AND h.outcome_type = $2 AND h.shares_amount::numeric > 0
             FOR UPDATE`,
            [marketId, outcome]
        );

        for (const row of winnersRes.rows) {
            const shares = parseFloat(row.shares_amount);
            if (shares <= 0) continue;

            const payout = shares * 10.0;

            await client.query(
                `INSERT INTO settlement_payouts (
                    settlement_id,
                    market_id,
                    local_user_id,
                    holding_id,
                    central_user_id,
                    payout_amount,
                    idempotency_key,
                    payout_status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
                [
                    settlementId,
                    marketId,
                    row.local_user_id,
                    row.holding_id,
                    row.central_user_id,
                    payout,
                    `resolve-${marketId}-${row.holding_id}`,
                ]
            );
        }

        await client.query(
            'UPDATE holdings SET shares_amount = 0 WHERE market_id = $1',
            [marketId]
        );

        if (winnersRes.rows.length === 0) {
            await client.query(
                'UPDATE market_settlements SET status = $1 WHERE id = $2',
                ['COMPLETED', settlementId]
            );
        }

        await client.query('COMMIT');

        // [Phase 3] Trigger QStash untuk proses Queueing Payout
        const qstashToken = process.env.QSTASH_TOKEN;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const apiKey = process.env.MARKET_RESOLUTION_API_KEY || '';

        if (qstashToken && winnersRes.rows.length > 0) {
            const processUrl = `${appUrl}/api/settlements/process`;
            try {
                await fetch(`https://qstash.upstash.io/v2/publish/${processUrl}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${qstashToken}`,
                        'Content-Type': 'application/json',
                        'x-resolution-key': apiKey,
                    },
                    body: JSON.stringify({ limit: 50 })
                });
            } catch (err) {
                console.error("Failed to trigger settlement queue", err);
            }
        }

        return {
            marketId,
            settlement_id: settlementId,
            resolved_outcome: outcome,
            winners_count: winnersRes.rows.length,
            pending_payouts: winnersRes.rows.length,
        };
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function refreshSettlementStatus(settlementId: string) {
    const client = await pool.connect();
    try {
        const countersRes = await client.query(
            `SELECT
                COUNT(*) FILTER (WHERE payout_status IN ('PENDING', 'PROCESSING')) AS remaining_count,
                COUNT(*) FILTER (WHERE payout_status = 'FAILED') AS failed_count
             FROM settlement_payouts
             WHERE settlement_id = $1`,
            [settlementId]
        );

        const remainingCount = Number(countersRes.rows[0].remaining_count ?? 0);
        const failedCount = Number(countersRes.rows[0].failed_count ?? 0);

        let status: SettlementStatus = 'PENDING_PAYOUT';
        if (remainingCount === 0) {
            status = failedCount > 0 ? 'PARTIAL_FAILED' : 'COMPLETED';
        }

        await client.query(
            'UPDATE market_settlements SET status = $1 WHERE id = $2',
            [status, settlementId]
        );
    } finally {
        client.release();
    }
}

export async function processPendingSettlementPayouts(limit = 50) {
    const client = await pool.connect();
    const safeLimit = Math.max(1, Math.min(limit, 200));

    try {
        await client.query('BEGIN');

        const jobsRes = await client.query(
            `SELECT id, settlement_id, central_user_id, payout_amount, idempotency_key
             FROM settlement_payouts
             WHERE payout_status = 'PENDING'
             ORDER BY created_at ASC
             LIMIT $1
             FOR UPDATE SKIP LOCKED`,
            [safeLimit]
        );

        const jobs = jobsRes.rows;

        if (jobs.length === 0) {
            await client.query('COMMIT');
            return {
                picked: 0,
                paid: 0,
                failed: 0,
                settlements_updated: 0,
            };
        }

        const jobIds = jobs.map(job => job.id);
        await client.query(
            'UPDATE settlement_payouts SET payout_status = $1 WHERE id = ANY($2::uuid[])',
            ['PROCESSING', jobIds]
        );

        await client.query('COMMIT');

        let paid = 0;
        let failed = 0;
        const settlementIds = new Set<string>();

        for (const job of jobs) {
            settlementIds.add(job.settlement_id);
            try {
                const payoutAmount = parseFloat(job.payout_amount);
                const creditRes = await creditCentralPoints(
                    job.central_user_id,
                    payoutAmount,
                    job.idempotency_key
                );

                await pool.query(
                    `UPDATE settlement_payouts
                     SET payout_status = 'PAID',
                         central_transaction_id = $1,
                         processed_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [creditRes.global_transaction_id ?? null, job.id]
                );
                paid += 1;
            } catch (error: unknown) {
                await pool.query(
                    `UPDATE settlement_payouts
                     SET payout_status = 'FAILED',
                         retry_count = retry_count + 1,
                         last_error = $1,
                         processed_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [getErrorMessage(error), job.id]
                );
                failed += 1;
            }
        }

        for (const settlementId of settlementIds) {
            await refreshSettlementStatus(settlementId);
        }

        return {
            picked: jobs.length,
            paid,
            failed,
            settlements_updated: settlementIds.size,
        };
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function requeueFailedSettlementPayouts(options?: {
    settlementId?: string;
    marketId?: string;
    payoutIds?: string[];
    limit?: number;
    maxRetries?: number;
}) {
    const client = await pool.connect();
    const limit = Math.max(1, Math.min(options?.limit ?? 100, 500));
    const maxRetries = Math.max(1, Math.min(options?.maxRetries ?? 5, 20));
    const payoutIds = options?.payoutIds && options.payoutIds.length > 0 ? options.payoutIds : null;

    try {
        await client.query('BEGIN');

        const requeueRes = await client.query(
            `WITH picked AS (
                SELECT id, settlement_id
                FROM settlement_payouts
                WHERE payout_status = 'FAILED'
                AND retry_count < $1
                AND ($2::uuid IS NULL OR settlement_id = $2)
                AND ($3::uuid IS NULL OR market_id = $3)
                AND ($4::uuid[] IS NULL OR id = ANY($4::uuid[]))
                ORDER BY processed_at ASC NULLS FIRST, created_at ASC
                LIMIT $5
                FOR UPDATE SKIP LOCKED
            )
            UPDATE settlement_payouts sp
            SET payout_status = 'PENDING',
                last_error = NULL,
                processed_at = NULL
            FROM picked
            WHERE sp.id = picked.id
            RETURNING sp.id, sp.settlement_id`,
            [
                maxRetries,
                options?.settlementId ?? null,
                options?.marketId ?? null,
                payoutIds,
                limit,
            ]
        );

        const requeued = requeueRes.rows.length;
        const settlementIds = Array.from(
            new Set<string>(requeueRes.rows.map(row => String(row.settlement_id)))
        );

        if (settlementIds.length > 0) {
            await client.query(
                'UPDATE market_settlements SET status = $1 WHERE id = ANY($2::uuid[])',
                ['PENDING_PAYOUT', settlementIds]
            );
        }

        await client.query('COMMIT');

        return {
            requeued,
            settlements_updated: settlementIds.length,
            limit,
            max_retries: maxRetries,
        };
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function listFailedSettlementPayouts(options?: {
    settlementId?: string;
    marketId?: string;
    limit?: number;
}) {
    const client = await pool.connect();
    const limit = Math.max(1, Math.min(options?.limit ?? 100, 500));

    try {
        const result = await client.query(
            `SELECT
                sp.id,
                sp.settlement_id,
                sp.market_id,
                m.title AS market_title,
                sp.local_user_id,
                lu.username,
                sp.central_user_id,
                sp.payout_amount,
                sp.payout_status,
                sp.retry_count,
                sp.last_error,
                sp.idempotency_key,
                sp.processed_at,
                sp.created_at
             FROM settlement_payouts sp
             JOIN markets m ON m.id = sp.market_id
             JOIN local_users lu ON lu.id = sp.local_user_id
             WHERE sp.payout_status = 'FAILED'
             AND ($1::uuid IS NULL OR sp.settlement_id = $1)
             AND ($2::uuid IS NULL OR sp.market_id = $2)
             ORDER BY sp.processed_at DESC NULLS LAST, sp.created_at DESC
             LIMIT $3`,
            [options?.settlementId ?? null, options?.marketId ?? null, limit]
        );

        return result.rows.map(row => ({
            id: row.id,
            settlement_id: row.settlement_id,
            market_id: row.market_id,
            market_title: row.market_title,
            local_user_id: row.local_user_id,
            username: row.username,
            central_user_id: row.central_user_id,
            payout_amount: parseFloat(row.payout_amount),
            payout_status: row.payout_status,
            retry_count: Number(row.retry_count),
            last_error: row.last_error,
            idempotency_key: row.idempotency_key,
            processed_at: row.processed_at,
            created_at: row.created_at,
        }));
    } finally {
        client.release();
    }
}