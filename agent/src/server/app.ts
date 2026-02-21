import express from "express";
import { config } from "../core/config.js";
import { createChildLogger } from "../core/logger.js";
import { healthRouter } from "./routes/health.js";
import { statsRouter } from "./routes/stats.js";
import { neighborhoodsRouter } from "./routes/neighborhoods.js";
import { listingsRouter } from "./routes/listings.js";
import { compareRouter } from "./routes/compare.js";
import type { MetricsCollector } from "../core/metrics.js";
import type { WalletManager } from "../wallet/wallet-manager.js";

const log = createChildLogger("server");

export interface AppContext {
  metrics: MetricsCollector;
  walletManager: WalletManager;
  db: any; // Will be typed properly when DB is set up
}

export function createApp(ctx: AppContext) {
  const app = express();

  app.use(express.json());

  // CORS for dashboard
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (_req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Attach context to requests
  app.use((req, _res, next) => {
    (req as any).ctx = ctx;
    next();
  });

  // Free routes (no payment required)
  app.use("/api/v1", healthRouter);
  app.use("/api/v1", statsRouter);

  // Data routes (will be x402 paywalled in Phase 3)
  app.use("/api/v1", neighborhoodsRouter);
  app.use("/api/v1", listingsRouter);
  app.use("/api/v1", compareRouter);

  // Error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      log.error({ err }, "Unhandled error");
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}

export function startServer(ctx: AppContext) {
  const app = createApp(ctx);

  app.listen(config.PORT, () => {
    log.info({ port: config.PORT }, "RealBase API server started");
  });

  return app;
}
