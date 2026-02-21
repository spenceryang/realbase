import { SF_NEIGHBORHOODS } from "@realbase/shared";
import { neighborhoods } from "./schema.js";
import { createChildLogger } from "../core/logger.js";

const log = createChildLogger("seed");

// Use any for db type to avoid circular dependency with index.ts
export function seedDatabase(db: any) {
  log.info("Seeding SF neighborhood data...");

  const existing = db.select().from(neighborhoods).all();
  if (existing.length > 0) {
    log.info({ count: existing.length }, "Neighborhoods already seeded");
    return;
  }

  for (const n of SF_NEIGHBORHOODS) {
    db.insert(neighborhoods)
      .values({
        zipcode: n.zipcode,
        name: n.name,
        lat: n.lat,
        lng: n.lng,
        areaSqMiles: n.areaSqMiles,
      })
      .onConflictDoNothing()
      .run();
  }

  log.info(
    { count: SF_NEIGHBORHOODS.length },
    "Seeded SF neighborhoods",
  );
}
