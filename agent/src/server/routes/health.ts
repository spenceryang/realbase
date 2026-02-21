import { Router } from "express";
import type { AppContext } from "../app.js";

export const healthRouter = Router();

healthRouter.get("/health", (req, res) => {
  const ctx = (req as any).ctx as AppContext;

  res.json({
    status: "ok",
    agent: ctx.metrics.getStatus(),
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});
