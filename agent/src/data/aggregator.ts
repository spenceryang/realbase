import { SF_NEIGHBORHOODS } from "@realbase/shared";
import { createChildLogger } from "../core/logger.js";
import type { MetricsCollector } from "../core/metrics.js";
import type { AppDatabase } from "../db/index.js";
import { neighborhoods, listings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { fetchCrimeData } from "./sources/sf-crime.js";
import { fetchSchoolsForNeighborhoods } from "./sources/greatschools.js";
import { fetchWalkScoresForNeighborhoods } from "./sources/walkscore.js";
import { fetchCensusData } from "./sources/census.js";
import { computeTransitForNeighborhoods } from "./sources/transit.js";
import { fetchDahliaListings } from "./sources/dahlia.js";
import { computeScores } from "./scoring.js";

const log = createChildLogger("aggregator");

export class DataAggregator {
  private lastSchoolFetch = 0;
  private lastWalkScoreFetch = 0;
  private lastCensusFetch = 0;
  private lastRentcastFetch = 0;

  private WEEKLY_MS = 7 * 24 * 60 * 60 * 1000;
  private MONTHLY_MS = 30 * 24 * 60 * 60 * 1000;

  constructor(
    private db: AppDatabase,
    private metrics: MetricsCollector,
  ) {}

  async fetchAll() {
    const now = Date.now();

    // Always fetch: crime data and DAHLIA listings (every tick)
    await this.fetchCrime();
    await this.fetchListings();

    // Weekly: schools, walk scores, transit
    if (now - this.lastSchoolFetch > this.WEEKLY_MS) {
      await this.fetchSchools();
      this.lastSchoolFetch = now;
    }

    if (now - this.lastWalkScoreFetch > this.WEEKLY_MS) {
      await this.fetchWalkScores();
      this.lastWalkScoreFetch = now;
    }

    // Transit is computed from static data — always fresh
    this.computeTransit();

    // Monthly: census data
    if (now - this.lastCensusFetch > this.MONTHLY_MS) {
      await this.fetchCensus();
      this.lastCensusFetch = now;
    }

    // Compute composite scores
    this.computeAllScores();
  }

  private async fetchCrime() {
    try {
      const crimeByHood = await fetchCrimeData();
      const timestamp = new Date().toISOString();

      for (const [hoodName, crimeData] of crimeByHood) {
        // Find matching neighborhood by name
        const match = SF_NEIGHBORHOODS.find(
          (n) =>
            n.name.toLowerCase() === hoodName.toLowerCase() ||
            hoodName.toLowerCase().includes(n.name.toLowerCase()),
        );
        if (match) {
          this.db
            .update(neighborhoods)
            .set({
              crimeCount90d: crimeData.incidentCount,
              crimePerSqMile: crimeData.incidentCount / match.areaSqMiles,
              dataUpdatedAt: timestamp,
            })
            .where(eq(neighborhoods.zipcode, match.zipcode))
            .run();
        }
      }

      this.metrics.updateDataFreshness("crime");
      log.info({ neighborhoods: crimeByHood.size }, "Crime data updated");
    } catch (error) {
      log.error({ error }, "Failed to update crime data");
    }
  }

  private async fetchListings() {
    try {
      const dahliaListings = await fetchDahliaListings();
      const timestamp = new Date().toISOString();

      for (const listing of dahliaListings) {
        this.db
          .insert(listings)
          .values({
            ...listing,
            createdAt: timestamp,
            updatedAt: timestamp,
          })
          .onConflictDoUpdate({
            target: listings.id,
            set: {
              rentMonthly: listing.rentMonthly,
              applicationDeadline: listing.applicationDeadline,
              updatedAt: timestamp,
            },
          })
          .run();
      }

      this.metrics.updateDataFreshness("dahlia");
      log.info({ count: dahliaListings.length }, "Listings updated");
    } catch (error) {
      log.error({ error }, "Failed to update listings");
    }
  }

  private async fetchSchools() {
    try {
      const locations = SF_NEIGHBORHOODS.map((n) => ({
        zipcode: n.zipcode,
        lat: n.lat,
        lng: n.lng,
      }));

      const schoolsByHood = await fetchSchoolsForNeighborhoods(locations);

      for (const [zipcode, schools] of schoolsByHood) {
        const avgRating =
          schools.length > 0
            ? schools.reduce((s, sch) => s + sch.rating, 0) / schools.length
            : 0;

        this.db
          .update(neighborhoods)
          .set({ avgSchoolRating: Math.round(avgRating * 10) / 10 })
          .where(eq(neighborhoods.zipcode, zipcode))
          .run();
      }

      this.metrics.updateDataFreshness("greatschools");
      log.info("School ratings updated");
    } catch (error) {
      log.error({ error }, "Failed to update school data");
    }
  }

  private async fetchWalkScores() {
    try {
      const locations = SF_NEIGHBORHOODS.map((n) => ({
        zipcode: n.zipcode,
        name: n.name,
        lat: n.lat,
        lng: n.lng,
      }));

      const walkScores = await fetchWalkScoresForNeighborhoods(locations);

      for (const [zipcode, scores] of walkScores) {
        this.db
          .update(neighborhoods)
          .set({
            walkScoreRaw: scores.walkScore,
            transitScoreRaw: scores.transitScore,
            bikeScoreRaw: scores.bikeScore,
          })
          .where(eq(neighborhoods.zipcode, zipcode))
          .run();
      }

      this.metrics.updateDataFreshness("walkscore");
      log.info("Walk scores updated");
    } catch (error) {
      log.error({ error }, "Failed to update Walk Scores");
    }
  }

  private computeTransit() {
    const locations = SF_NEIGHBORHOODS.map((n) => ({
      zipcode: n.zipcode,
      lat: n.lat,
      lng: n.lng,
    }));

    const transitData = computeTransitForNeighborhoods(locations);

    for (const [zipcode, transit] of transitData) {
      // Use stopsWithinOneMile as a proxy for transit score if Walk Score unavailable
      const existingRow = this.db
        .select()
        .from(neighborhoods)
        .where(eq(neighborhoods.zipcode, zipcode))
        .get();

      if (existingRow && !existingRow.transitScoreRaw) {
        // Estimate transit score: more stops = higher score
        const estimatedScore = Math.min(
          100,
          transit.stopsWithinOneMile * 15,
        );
        this.db
          .update(neighborhoods)
          .set({ transitScoreRaw: estimatedScore })
          .where(eq(neighborhoods.zipcode, zipcode))
          .run();
      }
    }

    this.metrics.updateDataFreshness("transit");
  }

  private async fetchCensus() {
    try {
      const zipcodes = SF_NEIGHBORHOODS.map((n) => n.zipcode);
      const censusData = await fetchCensusData(zipcodes);

      for (const [zipcode, data] of censusData) {
        this.db
          .update(neighborhoods)
          .set({
            medianIncome: data.medianIncome,
            medianRent: data.medianRent,
            population: data.population,
          })
          .where(eq(neighborhoods.zipcode, zipcode))
          .run();
      }

      this.metrics.updateDataFreshness("census");
      log.info("Census data updated");
    } catch (error) {
      log.error({ error }, "Failed to update Census data");
    }
  }

  private computeAllScores() {
    const allHoods = this.db.select().from(neighborhoods).all();

    for (const hood of allHoods) {
      const scores = computeScores({
        avgSchoolRating: hood.avgSchoolRating || 0,
        crimePerSqMile: hood.crimePerSqMile || 0,
        transitScoreRaw: hood.transitScoreRaw || 0,
        walkScoreRaw: hood.walkScoreRaw || 0,
        medianIncome: hood.medianIncome || 0,
        medianRent: hood.medianRent || 0,
      });

      this.db
        .update(neighborhoods)
        .set({
          compositeScore: scores.composite,
          schoolScore: scores.school,
          safetyScore: scores.safety,
          transitScore: scores.transit,
          walkabilityScore: scores.walkability,
          affordabilityScore: scores.affordability,
          scoresUpdatedAt: new Date().toISOString(),
        })
        .where(eq(neighborhoods.zipcode, hood.zipcode))
        .run();
    }

    log.info({ count: allHoods.length }, "All neighborhood scores computed");
  }
}
