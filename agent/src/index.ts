import { config } from "./core/config.js";
import { createChildLogger } from "./core/logger.js";
import { MetricsCollector } from "./core/metrics.js";
import { AgentLoop } from "./core/agent-loop.js";
import { WalletManager } from "./wallet/wallet-manager.js";
import { GasManager } from "./wallet/gas-manager.js";
import { DataAggregator } from "./data/aggregator.js";
import { initDatabase } from "./db/index.js";
import { startServer } from "./server/app.js";

const log = createChildLogger("main");

async function main() {
  log.info("=== RealBase Agent Starting ===");
  log.info({ port: config.PORT, builderCode: config.BUILDER_CODE }, "Config");

  // Initialize database
  const db = initDatabase();

  // Initialize components
  const metrics = new MetricsCollector();
  const walletManager = new WalletManager();

  // Initialize wallet
  const privateKey = config.AGENT_PRIVATE_KEY || undefined;
  const address = await walletManager.initialize(privateKey);
  log.info({ address }, "Agent wallet ready");

  const gasManager = new GasManager(walletManager);
  const aggregator = new DataAggregator(db, metrics);

  // Start Express API server
  startServer({ metrics, walletManager, db });

  // Start autonomous agent loop
  const agentLoop = new AgentLoop(
    walletManager,
    gasManager,
    metrics,
    aggregator,
  );

  // Graceful shutdown
  process.on("SIGINT", () => {
    log.info("Shutting down...");
    agentLoop.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    log.info("Shutting down...");
    agentLoop.stop();
    process.exit(0);
  });

  // Start the loop (runs forever)
  await agentLoop.start();
}

main().catch((error) => {
  log.error({ error }, "Fatal error");
  process.exit(1);
});
