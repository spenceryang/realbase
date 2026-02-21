import { Router } from "express";
import { SF_NEIGHBORHOODS } from "@realbase/shared";

export const compareRouter = Router();

// Will be x402 paywalled: compare two neighborhoods
compareRouter.get("/compare", (req, res) => {
  const { zip1, zip2 } = req.query;

  if (!zip1 || !zip2) {
    return res
      .status(400)
      .json({ error: "Provide zip1 and zip2 query params" });
  }

  const n1 = SF_NEIGHBORHOODS.find((n) => n.zipcode === zip1);
  const n2 = SF_NEIGHBORHOODS.find((n) => n.zipcode === zip2);

  if (!n1 || !n2) {
    return res.status(404).json({ error: "One or both zipcodes not found" });
  }

  // TODO: Return scored comparison once data pipeline is built
  res.json({
    comparison: [
      { ...n1, scores: null },
      { ...n2, scores: null },
    ],
    recommendation: "Scores not yet computed",
    notice: "Full comparison available once data pipeline is running",
  });
});
