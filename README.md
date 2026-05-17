# 🧩 Jigsaw Market

> Jigsaw Market is a full-stack prediction market platform built with Next.js + PostgreSQL. Users can buy/sell YES/NO shares on real-world event outcomes using virtual Jigsaw Coins.

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

| Service | Description | Default Port |
|---|---|---|
| **Jigsaw Coin API** (Express.js) | Central wallet — manages user balance & global auth | `3000` |
| **Jigsaw Market** (Next.js) | Main prediction market app — AMM trading, markets, portfolio, leaderboard | `3001` |

Both services share PostgreSQL databases (separate schemas) and communicate via internal API calls authenticated with a shared API key.

---

## 📊 Diagrams

### UML - Use Case
![jigsaw market UML](<docs/finpro sbd-Page-4.drawio.png>)
### ERD — Entity Relationship Diagram
#### Jigsaw Market Database
![jigsaw market ERD](<docs/finpro sbd-Page-1.drawio.png>)

#### Jigsaw Coin API Database
![jigsaw coin erd](<docs/finpro sbd-Page-2.jpg>)

### Flowchart - User Activity Flow
![Flow chart](<docs/finpro sbd-Page-3.drawio (2).png>)
---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) v14 or later (running locally or via a cloud provider)
- [Redis](https://redis.io/) or [Upstash](https://upstash.com/) (for market price caching)
- `npm` or `yarn`

---

## ⚙️ Installation Guide

### 1. Clone both repositories

```bash
# Main Jigsaw market app
git clone https://github.com/Chordius/Jigsaw-Market-Next.git
cd Jigsaw-Market-Next

# Central coin API
git clone https://github.com/Chordius/Jigsaw-Coin-API.git
cd Jigsaw-Coin-API
```

### 2. Install dependencies
Run npm install to install all dependencies
```bash
# In Jigsaw-Market-Next/
npm install

# In Jigsaw-Coin-API/
npm install
```

---

## 🔑 Environment Variables

### `Jigsaw-Coin-API/.env`

```env
# PostgreSQL connection string for the Coin API database
PG_CONNECTION_STRING=postgresql://postgres:yourpassword@localhost:5432/jigsaw_coin

# Port for the Coin API server
PORT=3000
```

### `Jigsaw-Market-Next/.env.local`

```env
# PostgreSQL connection string for the Market database
POLYMARKET_DB_URL=postgresql://postgres:yourpassword@localhost:5432/jigsaw_market

# URL of the Jigsaw Coin API (change port if running remotely)
CENTRAL_API_URL=http://localhost:3000

# API key registered in the Coin API — must match the key in Jigsaw-Coin-API
CENTRAL_WALLET_API_KEY=your_api_key_here

# API key for resolving markets (admin operations)
MARKET_RESOLUTION_API_KEY=your_resolution_secret_here

# Upstash Redis (for market price caching)
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Public API base URL (used by the frontend)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# JWT secret for session cookies
JWT_SECRET=your_super_secret_jwt_key
```

> **Note:** The `CENTRAL_WALLET_API_KEY` must match a key registered in the Coin API's database. Refer to the [Jigsaw Coin API README](https://github.com/Chordius/Jigsaw-Coin-API) for instructions on how to register an API key.

---

## 🚀 Running the Application

### Step 1 — Start Jigsaw Coin API

```bash
cd Jigsaw-Coin-API
npm run dev
# Server starts on http://localhost:3000
```

### Step 2 — Start Jigsaw Market Next

Open a second terminal:

```bash
cd Jigsaw-Market-Next
npm run dev
# Server starts on http://localhost:3001
```

### Step 3 — Open in browser

```
http://localhost:3001
```

> ⚠️ The Jigsaw Coin API must be running before starting the Market Next app, as the market app authenticates users and processes coin transactions via the Coin API.

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
