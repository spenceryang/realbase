# RealBase

Self-sustaining autonomous agent for San Francisco affordable housing data, built on [Base](https://base.org).

**Live Dashboard:** [realbase.vercel.app](https://realbase.vercel.app)

## What It Does

RealBase is an autonomous agent that aggregates data from 7 sources, scores SF neighborhoods for affordable housing, and earns revenue through onchain services -- creating a closed-loop economy on Base.

### Data Sources

| Source | Data | Update Frequency |
|--------|------|-----------------|
| GreatSchools | School ratings (K-12) | Weekly |
| SF OpenData | Crime incident density | Every tick (15 min) |
| Census ACS | Median income, rent, poverty | Monthly |
| Walk Score | Walk/transit/bike scores | Weekly |
| BART + Muni | Transit stop proximity | Static |
| DAHLIA | SF affordable housing listings | Every tick |
| RentCast | Market rent by zipcode | Weekly |

### Scoring Formula

Each neighborhood gets a composite score (0-10) based on weighted sub-scores:

```
composite = school * 0.25 + safety * 0.25 + transit * 0.20 + walkability * 0.15 + affordability * 0.15
```

### Revenue Streams

- **x402 Data API** -- Pay-per-request neighborhood data via HTTP 402 micropayments in USDC
- **NFT Reports** -- ERC-721 neighborhood analysis snapshots (0.001 ETH per public mint)
- **Onchain Oracle** -- Smart contract storing scores queryable by other contracts (0.0001 ETH per query)
- **Aave Yield** -- Idle USDC deposited into Aave V3 on Base

### Onchain Integration

Every transaction includes [ERC-8021](https://base.dev) builder codes for Base attribution. The agent also manages its own gas by swapping USDC to ETH via Uniswap V3 when reserves are low.

## Architecture

```
realbase/
  agent/          Express API server + autonomous loop
  contracts/      Solidity smart contracts (Hardhat)
  web/            Next.js 14 dashboard
  shared/         Shared types and constants
```

**Agent** (`agent/`): Express API serving neighborhood data, with a 15-minute autonomous tick cycle: health check -> fetch data -> score neighborhoods -> onchain updates -> autonomous decisions. Conservation mode activates when USDC < $5.

**Contracts** (`contracts/`):
- `RealBaseOracle.sol` -- Batch-updatable neighborhood score oracle with paid queries
- `RealBaseReport.sol` -- ERC-721 NFT reports with IPFS metadata

**Dashboard** (`web/`): Real-time visualization of agent economics -- sustainability ratio, revenue/cost breakdown, wallet balance, data freshness, and transaction feed with Basescan links.

## Deployed Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| RealBaseOracle | [`0x89BAa43839b3a0cD8DAbee08bcB30920a75F4716`](https://basescan.org/address/0x89BAa43839b3a0cD8DAbee08bcB30920a75F4716) |
| RealBaseReport | [`0x67E4cbFD4045a3F419A806c89Da7A6AAB11aEA3F`](https://basescan.org/address/0x67E4cbFD4045a3F419A806c89Da7A6AAB11aEA3F) |

Agent wallet: [`0x99d23BA1F2739fDd0c3f1e36CC4073160B13d032`](https://basescan.org/address/0x99d23BA1F2739fDd0c3f1e36CC4073160B13d032)

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your AGENT_PRIVATE_KEY

# Run the agent (starts API on port 4021)
cd agent && pnpm dev

# Run the dashboard (starts on port 3000)
cd web && pnpm dev
```

The agent runs with mock data when API keys are not configured. Add real keys to `.env` to switch to live data.

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/v1/health` | Free | Agent health check |
| `GET /api/v1/stats` | Free | Wallet balance, metrics, transactions |
| `GET /api/v1/neighborhoods` | Free | All 43 SF neighborhood scores |
| `GET /api/v1/neighborhood/:zipcode` | x402 | Detailed neighborhood data |
| `GET /api/v1/listings/search` | Free | Search affordable housing listings |
| `GET /api/v1/compare?zip1=X&zip2=Y` | Free | Compare two neighborhoods |

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Agent:** Express, ethers.js v6, drizzle-orm, better-sqlite3, pino
- **Contracts:** Solidity 0.8.24, Hardhat, OpenZeppelin
- **Dashboard:** Next.js 14, Tailwind CSS, Recharts
- **Blockchain:** Base Mainnet (Chain ID 8453)
- **DeFi:** Aave V3 (yield), Uniswap V3 (gas swaps)
- **Monorepo:** pnpm workspaces + Turborepo

## Environment Variables

See [`.env.example`](.env.example) for all configuration options. Required:

- `AGENT_PRIVATE_KEY` -- Wallet private key for Base Mainnet transactions

Optional (agent uses mock data without these):

- `GREATSCHOOLS_API_KEY` -- School ratings
- `WALKSCORE_API_KEY` -- Walk/transit/bike scores
- `CENSUS_API_KEY` -- Demographics data
- `RENTCAST_API_KEY` -- Market rent data

## License

MIT
