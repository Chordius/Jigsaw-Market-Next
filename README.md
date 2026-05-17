# 🧩 Jigsaw Market

> Jigsaw Market is a full-stack prediction market platform built with Next.js + PostgreSQL. Users can buy/sell YES/NO shares on real-world event outcomes using virtual Jigsaw Coins.

**Live App:** [jigsaw-market-next.vercel.app](https://jigsaw-market-next.vercel.app)<br/>
**Admin Area:** [jigsaw-market-next.vercel.app/admin](https://jigsaw-market-next.vercel.app/admin)

---

## 💻 Tech Stack

<div>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
</div>

---

## 🏗️ Architecture Overview

This project consists of two separate services:

| Service | Description |
|---|---|
| **Jigsaw Coin API** (Express.js) | Central wallet — manages user balance & global auth |
| **Jigsaw Market** (Next.js) | Main prediction market app — AMM trading, markets, portfolio, leaderboard |

Both services share PostgreSQL databases (separate schemas) and communicate via internal API calls authenticated with a shared API key.

---

## 📊 Diagrams

### UML - Use Case
![jigsaw market UML](<docs/finpro sbd-Page-4.drawio.png>)
### ERD — Entity Relationship Diagram
#### Jigsaw Market Database
![jigsaw market ERD](<docs/finpro sbd-Page-1.drawio (2).png>)

#### Jigsaw Coin API Database
![jigsaw coin erd](<docs/finpro sbd-Page-2.jpg>)

### Flowchart - User Activity Flow
![Flow chart](<docs/finpro sbd-Page-3.drawio (2).png>)
---

## 🚀 Deployed Links

- **Production app:** [jigsaw-market-next.vercel.app](https://jigsaw-market-next.vercel.app)
- **Production admin console:** [jigsaw-market-next.vercel.app/admin](https://jigsaw-market-next.vercel.app/admin)
- **Jigsaw Coin API:** [jigsaw-coin-api.vercel.app](https://jigsaw-coin-api.vercel.app/)

The repository is deployed on Vercel. Local installation and `npm run dev` instructions are intentionally omitted from this README.

---

## 🔌 Backend API Reference

### Public Next.js API routes

| Route | Method | Purpose | Input | Response |
|---|---|---|---|---|
| `/api/auth/register` | `POST` | Register a user in Jigsaw Market and create the linked central wallet user. | JSON body: `username`, `email`, `password` | `201` with `{ user }` on success; `400/429` on validation or rate-limit errors. |
| `/api/auth/login` | `POST` | Log a user in, create a session, and grant the daily coin bonus if eligible. | JSON body: `email`, `password` | `200` with `{ user }` on success; `400/401/429` on failure. |
| `/api/auth/logout` | `POST` | Destroy the active session. | None | `200` on success. |
| `/api/auth/session` | `GET` | Check whether a session is active. | None | `200` with `{ user }` or `401` if no session exists. |
| `/api/comments` | `GET` | Fetch comments for a market. | Query: `marketId` | `200` with comment rows; `400` if missing `marketId`. |
| `/api/comments` | `POST` | Create a market comment. | JSON body: `localUserId`, `marketId`, `content` | `201` with the created comment row. |
| `/api/trades` | `POST` | Execute a buy or sell trade. | JSON body: `localUserId`, `centralUserId`, `marketId`, `outcomeType`, `sharesToBuy` or `sharesToSell`, optional `action` | `200` with `{ newBalance, orderId }`; `402` if the wallet has insufficient balance. |
| `/api/markets` | `GET` | Fetch markets with filtering and sorting. | Query: `sortBy`, `order`, `status`, `category` | `200` with the market list. |
| `/api/markets` | `POST` | Create a market. | JSON body: `title`, `category`, `endDate`, optional `description` | `201` with the created market row. |
| `/api/markets/[id]` | `GET` | Fetch a single market by ID. | Route param: `id` | `200` with one market, `404` if missing. |
| `/api/markets/[id]/history` | `GET` | Fetch historical trade activity for a market. | Route param: `id` | `200` with an ordered trade history array. |
| `/api/markets/[id]/resolve` | `POST` | Resolve a market as `YES` or `NO` and queue settlement payouts. | Header: `x-resolution-key` or admin session; JSON body: `outcome` | `200` with settlement metadata and payout counts. |
| `/api/markets/leaderboard` | `GET` | Fetch top markets by activity. | Query: `limit`, `status` | `200` with leaderboard rows. |
| `/api/holdings/[userId]` | `GET` | Fetch the open portfolio holdings for a user. | Route param: `userId` | `200` with portfolio rows. |
| `/api/users/[userId]` | `GET` | Fetch a user profile plus current coin balance. | Route param: `userId` | `200` with profile data and balance; `404` if missing. |
| `/api/users/[userId]/orders` | `GET` | Fetch the user’s order history. | Route param: `userId` | `200` with order rows. |
| `/api/users/[userId]/payouts` | `GET` | Fetch paid settlement payouts for a user. | Route param: `userId` | `200` with payout rows. |
| `/api/users/[userId]/coin-history` | `GET` | Fetch central wallet transaction history for a user. | Route param: `userId` | `200` with history array. |
| `/api/users/leaderboard` | `GET` | Fetch the trading leaderboard for users. | Query: `limit` | `200` with ranked leaderboard rows. |
| `/api/admin/stats` | `GET` | Fetch admin dashboard statistics. | Admin session required | `200` with `{ stats, recent_activity }`; `401/403` if unauthorized. |
| `/api/admin/process-payouts` | `POST` | Manually trigger settlement payout processing. | Admin session required | `200` with processing results. |
| `/api/admin/markets` | `GET` | Fetch all markets for the admin console. | Admin session required | `200` with market rows. |
| `/api/admin/markets/create` | `POST` | Create a market from the admin console. | Admin session required; JSON body: `title`, `category`, `end_date`, optional `description` | `201` with the created market row. |
| `/api/settlements/process` | `POST` | QStash webhook that processes pending payout jobs in batches. | QStash signature or local `x-resolution-key`; optional JSON body: `limit` | `200` with batch processing stats. |
| `/api/settlements/failed` | `GET` | Inspect failed settlement payouts. | Header: `x-resolution-key`; optional query: `settlementId`, `marketId`, `limit` | `200` with `{ count, items }`. |
| `/api/settlements/retry` | `POST` | Requeue failed settlement payouts and optionally process them immediately. | Header: `x-resolution-key`; JSON body: `settlementId`, `marketId`, `payoutIds`, `limit`, `maxRetries`, `processNow`, `processLimit` | `200` with `{ requeue, process }`. |

### Central wallet helper functions

These functions live in [lib/jigsawcoin.ts](lib/jigsawcoin.ts) and are the repo’s direct client for the Jigsaw Coin API.

| Function | What it calls | Request body / arguments | Expected return |
|---|---|---|---|
| `deductCentralPoints(globalUserId, amount, localReferenceId)` | `POST /api/v1/wallet/transaction` | `{ global_user_id, amount: -abs(amount), reference_id }` | Wallet transaction payload, including `global_transaction_id` and `new_balance`. Throws on failure or insufficient balance. |
| `creditCentralPoints(globalUserId, amount, localReferenceId)` | `POST /api/v1/wallet/transaction` | `{ global_user_id, amount: abs(amount), reference_id }` | Wallet transaction payload, including `global_transaction_id` and `new_balance`. Throws on failure. |
| `lookupGlobalUser(email)` | `GET /api/v1/user/lookup/:email` | `email` path param | User payload, or `null` if the Coin API returns `404`. |
| `registerGlobalUser(email, passwordRaw)` | `POST /api/v1/user/register` | `{ email, password }` | Global user payload, typically including `global_user_id`. |
| `loginGlobalUser(email, passwordRaw)` | `POST /api/v1/user/login` | `{ email, password }` | Global auth payload, typically including `global_user_id`. |
| `fetchCentralBalance(globalUserId)` | `GET /api/v1/wallet/balance/:id` | `globalUserId` path param | Wallet balance payload. |
| `fetchCentralHistory(globalUserId)` | `GET /api/v1/wallet/history/:id` | `globalUserId` path param | Transaction history array, or `[]` if the Coin API returns `404`. |

### Internal service functions

| Function | What it does | Return shape |
|---|---|---|
| `registerUserService(username, email, passwordRaw)` | Creates a central wallet user, stores the local profile, and grants the daily 100 coin reward if eligible. | Local user row with `id`, `central_user_id`, `username`, `email`. |
| `loginUserService(email, passwordRaw)` | Authenticates against the Coin API, creates a local profile if needed, and grants the daily reward once per UTC day. | `{ id, central_user_id, username }`. |
| `getOpenMarketsService(options)` | Fetches markets with filtering/sorting and live AMM-derived prices. | Array of market records with `price_yes`, `price_no`, `investor_count`, and `total_invested`. |
| `getMarketByIdService(marketId)` | Fetches a single market with pricing metadata. | One market record or `null`. |
| `createMarketService(title, category, endDate, description?)` | Inserts a new market with default liquidity. | Created market record with derived prices. |
| `getMarketLeaderboardService(options)` | Ranks markets by volume and trader activity. | Array of ranked market rows. |
| `resolveMarketService(marketId, outcome, resolvedBy?)` | Marks a market resolved, queues payout rows, and fires QStash when needed. | Settlement summary with `marketId`, `settlement_id`, `resolved_outcome`, `winners_count`, and `pending_payouts`. |
| `processPendingSettlementPayouts(limit?)` | Processes pending payout jobs and credits the central wallet. | Batch stats: `picked`, `paid`, `failed`, `settlements_updated`. |
| `requeueFailedSettlementPayouts(options?)` | Requeues failed payout jobs, optionally processing them immediately. | Requeue stats with `requeued`, `settlements_updated`, `limit`, and `max_retries`. |
| `listFailedSettlementPayouts(options?)` | Lists failed payout rows for admin troubleshooting. | Array of failed payout records. |
| `getCommentsByMarketIdService(marketId)` | Fetches comments for a market. | Comment row array. |
| `createCommentService(localUserId, marketId, content)` | Inserts a new comment. | Created comment row. |
| `executeTrade(localUserId, centralUserId, marketId, outcomeType, sharesToBuy)` | Buys YES/NO shares, deducts central coins, and updates holdings/liquidity. | `{ newBalance, orderId }`. |
| `executeSellTrade(localUserId, centralUserId, marketId, outcomeType, sharesToSell)` | Sells YES/NO shares, credits central coins, and updates holdings/liquidity. | `{ newBalance, orderId }`. |
| `getUserProfileService(localUserId)` | Returns a local user profile plus the current central balance. | Profile object with `balance`. |
| `getUserHoldingsService(localUserId)` | Returns current portfolio positions and unrealized PnL. | Portfolio row array. |
| `getUserTradingLeaderboardService(limit?)` | Builds the user leaderboard from trades, positions, and paid payouts. | Ranked leaderboard array. |

---

## Relevant APIs / Libraries Used

| Library / API | Where it is used | What it does |
|---|---|---|
| **Next.js** | `app/**`, `app/api/**`, `lib/auth.ts` | Framework for routing, server components, API routes, and session helpers. |
| **React** | `app/**`, `components/**`, `context/**` | UI rendering, hooks, state, and interactive client components. |
| **TypeScript** | Entire repo | Type safety for services, API routes, components, and shared types. |
| **Tailwind CSS** | `app/globals.css`, `tailwind.config.*`, UI components | Utility-first styling for the app shell, dashboards, and cards. |
| **Axios** | `lib/jigsawcoin.ts`, `lib/apiClient.ts` | HTTP client used to call the central Jigsaw Coin API and the app’s own REST endpoints from the frontend. |
| **jose** | `lib/auth.ts` | Creates and verifies session JWTs stored in secure HTTP-only cookies. |
| **bcryptjs** | Installed dependency; auth-related flows | Password hashing library available for auth work. The current login/register flow relies on the central wallet auth API. |
| **@upstash/qstash** | `services/market.service.ts`, `app/api/settlements/process/route.ts` | Queues settlement payout processing and verifies QStash webhook signatures. |
| **@upstash/redis** | `lib/redis.ts`, `app/api/users/leaderboard/route.ts` | Caches leaderboard data and reduces repeated reads. |
| **@upstash/ratelimit** | `lib/ratelimit.ts`, auth/trade routes | Adds request throttling for login, registration, and trade requests. |
| **pg** | `lib/db.ts`, all service files | PostgreSQL client used for market, trade, settlement, comment, and user data. |
| **uuid** | `services/trade.services.ts` | Generates unique local order IDs for buy/sell trades. |
| **react-icons** | UI components | Icon library for dashboard, market, and navigation visuals. |
| **recharts** | Analytics / charting UI | Charting library for market and trading visualizations. |
| **Material Symbols** | UI components | Icon set used across cards, buttons, and navigation. |

The main external APIs called by the repo are the deployed **Jigsaw Coin API** for global auth and wallet transactions, and **Upstash QStash** for settlement processing. The app itself exposes the Next.js API routes documented above.

---

## 💻 Progress Report:
![Flow chart](<docs/progress report_finpro sbd.jpeg>)
---
## 🔗 Related Repositories

- **Jigsaw Coin API** → [github.com/Chordius/Jigsaw-Coin-API](https://github.com/Chordius/Jigsaw-Coin-API)
- **Jigsaw Market Next** → [github.com/Chordius/Jigsaw-Market-Next](https://github.com/Chordius/Jigsaw-Market-Next)

---

## 📄 License

[MIT](./LICENSE) © 2026 Jigsaw Market Team
