import { config } from "./config.js";
import { createChildLogger } from "./logger.js";
import type { MetricsCollector } from "./metrics.js";
import type { WalletManager } from "../wallet/wallet-manager.js";
import type { GasManager } from "../wallet/gas-manager.js";
import type { DataAggregator } from "../data/aggregator.js";

const log = createChildLogger("agent-loop");

export class AgentLoop {
  private running = false;

  constructor(
    private walletManager: WalletManager,
    private gasManager: GasManager,
    private metrics: MetricsCollector,
    private aggregator: DataAggregator,
  ) {}

  async start() {
    this.running = true;
    this.metrics.setStatus("running");
    log.info("Agent loop started");

    // Run initial data fetch immediately
    try {
      log.info("Running initial data fetch...");
      await this.aggregator.fetchAll();
      log.info("Initial data fetch complete");
    } catch (error) {
      log.error({ error }, "Initial data fetch failed");
    }

    while (this.running) {
      // Sleep first (initial fetch already done)
      await this.sleep(config.AGENT_TICK_INTERVAL_MS);

      try {
        await this.tick();
      } catch (error) {
        log.error({ error }, "Error in agent tick");
        this.metrics.setStatus("error");
      }
    }
  }

  stop() {
    this.running = false;
    this.metrics.setStatus("stopped");
    log.info("Agent loop stopped");
  }

  private async tick() {
    this.metrics.recordTick();
    log.info("--- Agent Tick ---");

    // Phase 1: Health Check
    await this.healthCheck();

    // Phase 2: Fetch & Score Data
    await this.aggregator.fetchAll();

    // Phase 3: Onchain Updates
    await this.onchainUpdates();

    // Phase 4: Autonomous Decisions
    await this.autonomousDecisions();

    log.info("--- Tick Complete ---");
  }

  private async healthCheck() {
    try {
      const balance = await this.walletManager.getBalance();
      const usdcBalance = parseFloat(balance.usdcFormatted);
      const ethBalance = parseFloat(balance.ethFormatted);

      log.info(
        { eth: balance.ethFormatted, usdc: balance.usdcFormatted },
        "Wallet balance",
      );

      // Check if we need gas
      if (ethBalance < config.MIN_GAS_RESERVE_ETH) {
        log.warn("Low ETH for gas, attempting swap");
        await this.gasManager.ensureGasReserve();
      }

      // Conservation mode
      if (usdcBalance < config.MIN_OPERATING_BALANCE_USDC) {
        log.warn(
          { balance: usdcBalance },
          "CONSERVATION MODE: Balance below minimum",
        );
        this.metrics.setStatus("conservation");
      } else {
        this.metrics.setStatus("running");
      }
    } catch (error) {
      log.error({ error }, "Health check failed");
    }
  }

  private async onchainUpdates() {
    if (this.metrics.getStatus() === "conservation") {
      log.info("Skipping onchain updates (conservation mode)");
      return;
    }
    // TODO: Phase 4 — oracle updates and NFT minting
    log.info("Onchain updates: will be implemented in Phase 4");
  }

  private async autonomousDecisions() {
    const ratio = this.metrics.getSustainabilityRatio();
    log.info({ sustainabilityRatio: ratio }, "Self-assessment");

    // TODO: Phase 5 — pricing adjustments, mint prioritization
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
