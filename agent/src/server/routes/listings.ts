import { Router } from "express";
import { listings } from "../../db/schema.js";

export const listingsRouter = Router();

listingsRouter.get("/listings/search", (req, res) => {
  const { zipcode, maxRent, minBedrooms, limit, offset } = req.query;
  const db = (req as any).ctx.db;

  let results = db.select().from(listings).all();

  if (zipcode) {
    results = results.filter((l: any) => l.zipcode === zipcode);
  }
  if (maxRent) {
    const max = Number(maxRent);
    results = results.filter((l: any) => l.rentMonthly && l.rentMonthly <= max);
  }
  if (minBedrooms) {
    const min = Number(minBedrooms);
    results = results.filter((l: any) => l.bedrooms && l.bedrooms >= min);
  }

  const total = results.length;
  const off = Number(offset) || 0;
  const lim = Number(limit) || 50;
  results = results.slice(off, off + lim);

  res.json({
    listings: results,
    total,
    filters: {
      zipcode: zipcode || null,
      maxRent: maxRent ? Number(maxRent) : null,
      minBedrooms: minBedrooms ? Number(minBedrooms) : null,
    },
  });
});
