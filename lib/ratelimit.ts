import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Create a new ratelimiter, that allows 5 requests per 10 seconds
export const tradeRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/trade",
});

// Stricter rate limit for authentication (e.g., login/register)
export const authRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "15 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});
