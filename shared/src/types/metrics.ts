export interface AgentMetrics {
  walletBalance: WalletBalance;
  revenue: RevenueSummary;
  costs: CostSummary;
  sustainabilityRatio: number; // revenue / costs, >1 = self-sustaining
  uptime: number; // seconds since agent start
  lastTickAt: string;
  tickCount: number;
  dataFreshness: DataFreshness;
}

export interface WalletBalance {
  ethWei: string;
  ethFormatted: string;
  usdcRaw: string;
  usdcFormatted: string;
  aaveDepositedUsdc: string;
  totalUsdValue: string;
}

export interface RevenueSummary {
  total24h: string;
  total7d: string;
  total30d: string;
  bySource: {
    x402Api: string;
    nftMints: string;
    oracleQueries: string;
    aaveYield: string;
  };
}

export interface CostSummary {
  total24h: string;
  total7d: string;
  total30d: string;
  byCategory: {
    gas: string;
    apiCalls: string;
    hosting: string;
    x402Purchases: string;
  };
}

export interface DataFreshness {
  dahlia: string | null;
  crime: string | null;
  greatschools: string | null;
  walkscore: string | null;
  census: string | null;
  transit: string | null;
  rentcast: string | null;
}

export interface Transaction {
  id: string;
  type: "revenue" | "cost" | "defi";
  category: string;
  amount: string;
  token: "ETH" | "USDC";
  txHash?: string;
  builderCodeIncluded: boolean;
  timestamp: string;
  description: string;
}

export type AgentStatus = "running" | "conservation" | "stopped" | "error";
