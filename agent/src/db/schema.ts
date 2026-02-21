import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const neighborhoods = sqliteTable("neighborhoods", {
  zipcode: text("zipcode").primaryKey(),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  areaSqMiles: real("area_sq_miles").notNull(),
  // Composite scores
  compositeScore: real("composite_score").default(0),
  schoolScore: real("school_score").default(0),
  safetyScore: real("safety_score").default(0),
  transitScore: real("transit_score").default(0),
  walkabilityScore: real("walkability_score").default(0),
  affordabilityScore: real("affordability_score").default(0),
  // Raw data
  crimeCount90d: integer("crime_count_90d").default(0),
  crimePerSqMile: real("crime_per_sq_mile").default(0),
  walkScoreRaw: integer("walk_score_raw").default(0),
  transitScoreRaw: integer("transit_score_raw").default(0),
  bikeScoreRaw: integer("bike_score_raw").default(0),
  medianIncome: integer("median_income").default(0),
  medianRent: integer("median_rent").default(0),
  population: integer("population").default(0),
  avgSchoolRating: real("avg_school_rating").default(0),
  // Timestamps
  scoresUpdatedAt: text("scores_updated_at"),
  dataUpdatedAt: text("data_updated_at"),
});

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  source: text("source").notNull(), // dahlia, rentcast, manual
  address: text("address").notNull(),
  neighborhood: text("neighborhood"),
  zipcode: text("zipcode"),
  lat: real("lat"),
  lng: real("lng"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  rentMonthly: integer("rent_monthly"),
  amiPercentage: integer("ami_percentage"),
  isAffordable: integer("is_affordable", { mode: "boolean" }).default(false),
  applicationDeadline: text("application_deadline"),
  url: text("url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // revenue, cost, defi
  category: text("category").notNull(), // x402, nft, oracle, gas, api, etc.
  amount: text("amount").notNull(),
  token: text("token").notNull(), // ETH, USDC
  txHash: text("tx_hash"),
  builderCodeIncluded: integer("builder_code_included", {
    mode: "boolean",
  }).default(true),
  description: text("description"),
  timestamp: text("timestamp").notNull(),
});

export const agentState = sqliteTable("agent_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
