import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Rate limit untuk keamanan otentikasi (hindari brute-force / spam login)
// Maksimal 5 percobaan dalam 1 menit
export const authRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
});

// Rate limit untuk trading (mencegah spam klik transaksi atau eksploitasi API)
// Maksimal 5 transaksi dalam 10 detik per user
export const tradeRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/trade',
});
