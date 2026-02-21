import { Router } from "express";
import { SF_NEIGHBORHOODS } from "@realbase/shared";

export const neighborhoodsRouter = Router();

// Free: list all neighborhoods (names only)
neighborhoodsRouter.get("/neighborhoods", (_req, res) => {
  res.json({
    neighborhoods: SF_NEIGHBORHOODS.map((n) => ({
      name: n.name,
      zipcode: n.zipcode,
    })),
    total: SF_NEIGHBORHOODS.length,
  });
});

// Will be x402 paywalled: detailed neighborhood data
neighborhoodsRouter.get("/neighborhood/:zipcode", (req, res) => {
  const { zipcode } = req.params;
  const neighborhood = SF_NEIGHBORHOODS.find((n) => n.zipcode === zipcode);

  if (!neighborhood) {
    return res.status(404).json({ error: "Neighborhood not found" });
  }

  // TODO: Return scored data from database once data pipeline is built
  res.json({
    ...neighborhood,
    scores: {
      composite: 0,
      school: 0,
      safety: 0,
      transit: 0,
      walkability: 0,
      affordability: 0,
    },
    notice: "Scores will be populated once data pipeline is running",
  });
});
