import type {
  AgentMetrics,
  AgentStatus,
  Transaction,
  DataFreshness,
} from "@realbase/shared";
import { createChildLogger } from "./logger.js";

const log = createChildLogger("metrics");

export class MetricsCollector {
  private transactions: Transaction[] = [];
  private startTime = Date.now();
  private lastTickAt: string | null = null;
  private tickCount = 0;
  private status: AgentStatus = "stopped";
  private dataFreshness: DataFreshness = {
    dahlia: null,
    crime: null,
    greatschools: null,
    walkscore: null,
    census: null,
    transit: null,
    rentcast: null,
  };

  setStatus(status: AgentStatus) {
    this.status = status;
    log.info({ status }, "Agent status changed");
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  recordTick() {
    this.lastTickAt = new Date().toISOString();
    this.tickCount++;
  }

  recordTransaction(tx: Omit<Transaction, "id">) {
    const transaction: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    this.transactions.push(transaction);
    log.info(
      { type: tx.type, category: tx.category, amount: tx.amount },
      tx.description,
    );

    // Keep last 1000 transactions in memory
    if (this.transactions.length > 1000) {
      this.transactions = this.transactions.slice(-1000);
    }
  }

  updateDataFreshness(source: keyof DataFreshness) {
    this.dataFreshness[source] = new Date().toISOString();
  }

  getRecentTransactions(limit = 50): Transaction[] {
    return this.transactions.slice(-limit).reverse();
  }

  private sumTransactions(
    type: "revenue" | "cost",
    hoursAgo: number,
  ): number {
    const since = Date.now() - hoursAgo * 60 * 60 * 1000;
    return this.transactions
      .filter(
        (tx) => tx.type === type && new Date(tx.timestamp).getTime() > since,
      )
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  }

  private sumByCategory(
    type: "revenue" | "cost",
    category: string,
    hoursAgo: number,
  ): number {
    const since = Date.now() - hoursAgo * 60 * 60 * 1000;
    return this.transactions
      .filter(
        (tx) =>
          tx.type === type &&
          tx.category === category &&
          new Date(tx.timestamp).getTime() > since,
      )
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  }

  getSustainabilityRatio(): number {
    const rev7d = this.sumTransactions("revenue", 7 * 24);
    const cost7d = this.sumTransactions("cost", 7 * 24);
    if (cost7d === 0) return rev7d > 0 ? Infinity : 0;
    return rev7d / cost7d;
  }

  getMetrics(walletBalance: any): AgentMetrics {
    return {
      walletBalance,
      revenue: {
        total24h: this.sumTransactions("revenue", 24).toFixed(4),
        total7d: this.sumTransactions("revenue", 7 * 24).toFixed(4),
        total30d: this.sumTransactions("revenue", 30 * 24).toFixed(4),
        bySource: {
          x402Api: this.sumByCategory("revenue", "x402", 30 * 24).toFixed(4),
          nftMints: this.sumByCategory("revenue", "nft", 30 * 24).toFixed(4),
          oracleQueries: this.sumByCategory("revenue", "oracle", 30 * 24).toFixed(4),
          aaveYield: this.sumByCategory("revenue", "aave", 30 * 24).toFixed(4),
        },
      },
      costs: {
        total24h: this.sumTransactions("cost", 24).toFixed(4),
        total7d: this.sumTransactions("cost", 7 * 24).toFixed(4),
        total30d: this.sumTransactions("cost", 30 * 24).toFixed(4),
        byCategory: {
          gas: this.sumByCategory("cost", "gas", 30 * 24).toFixed(4),
          apiCalls: this.sumByCategory("cost", "api", 30 * 24).toFixed(4),
          hosting: this.sumByCategory("cost", "hosting", 30 * 24).toFixed(4),
          x402Purchases: this.sumByCategory("cost", "x402-purchase", 30 * 24).toFixed(4),
        },
      },
      sustainabilityRatio: this.getSustainabilityRatio(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      lastTickAt: this.lastTickAt || new Date().toISOString(),
      tickCount: this.tickCount,
      dataFreshness: this.dataFreshness,
    };
  }
}
