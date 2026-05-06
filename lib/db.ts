import { Pool } from 'pg';

const globalForPg = global as unknown as { pgPool: Pool };

export const pool = globalForPg.pgPool || new Pool({
    connectionString: process.env.POLYMARKET_DB_URL,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;