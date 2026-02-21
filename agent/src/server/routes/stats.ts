import { Router } from "express";
import type { AppContext } from "../app.js";

export const statsRouter = Router();

statsRouter.get("/stats", async (req, res) => {
  const ctx = (req as any).ctx as AppContext;

  try {
    const balance = await ctx.walletManager.getBalance();
    const metrics = ctx.metrics.getMetrics(balance);
    const transactions = ctx.metrics.getRecentTransactions(50);

    res.json({
      metrics,
      transactions,
      agent: {
        status: ctx.metrics.getStatus(),
        address: ctx.walletManager.getAddress(),
      },
    });
  } catch (error) {
    res.json({
      metrics: ctx.metrics.getMetrics({
        ethWei: "0",
        ethFormatted: "0.0",
        usdcRaw: "0",
        usdcFormatted: "0.0",
        aaveDepositedUsdc: "0",
        totalUsdValue: "0.0",
      }),
      transactions: ctx.metrics.getRecentTransactions(50),
      agent: {
        status: ctx.metrics.getStatus(),
        address: "not-initialized",
      },
    });
  }
});
