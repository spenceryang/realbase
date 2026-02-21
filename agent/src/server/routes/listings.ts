import { Router } from "express";

export const listingsRouter = Router();

// Will be x402 paywalled: search listings
listingsRouter.get("/listings/search", (req, res) => {
  const { zipcode, maxRent, minBedrooms, affordableOnly, limit, offset } =
    req.query;

  // TODO: Query database once data pipeline is built
  res.json({
    listings: [],
    total: 0,
    filters: {
      zipcode: zipcode || null,
      maxRent: maxRent ? Number(maxRent) : null,
      minBedrooms: minBedrooms ? Number(minBedrooms) : null,
      affordableOnly: affordableOnly === "true",
    },
    notice: "Listings will be populated once DAHLIA scraper is running",
  });
});
