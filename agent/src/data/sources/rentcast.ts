import { config } from "../../core/config.js";
import { createChildLogger } from "../../core/logger.js";

const log = createChildLogger("data:rentcast");

const RENTCAST_API = "https://api.rentcast.io/v1";

export interface RentcastData {
  zipcode: string;
  averageRent: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  listingCount: number;
}

export async function fetchMarketRent(
  zipcode: string,
): Promise<RentcastData | null> {
  if (!config.RENTCAST_API_KEY) {
    log.warn("No RentCast API key — using mock data");
    return getMockRentData(zipcode);
  }

  const url = `${RENTCAST_API}/avm/rent/zipcode/${zipcode}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": config.RENTCAST_API_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        log.warn("RentCast rate limit hit");
      }
      return null;
    }

    const data = await response.json();

    return {
      zipcode,
      averageRent: data.averageRent || 0,
      medianRent: data.medianRent || 0,
      minRent: data.minRent || 0,
      maxRent: data.maxRent || 0,
      listingCount: data.listingCount || 0,
    };
  } catch (error) {
    log.error({ error, zipcode }, "Failed to fetch RentCast data");
    return null;
  }
}

// Realistic SF rent data by zipcode range
const SF_RENT_ESTIMATES: Record<string, { avg: number; med: number }> = {
  "94102": { avg: 2800, med: 2650 }, // Tenderloin/Civic Center
  "94103": { avg: 3200, med: 3000 }, // SoMa
  "94104": { avg: 3500, med: 3300 }, // Financial District
  "94105": { avg: 3800, med: 3600 }, // Rincon Hill
  "94107": { avg: 3400, med: 3200 }, // Potrero/Dogpatch
  "94108": { avg: 2900, med: 2700 }, // Chinatown
  "94109": { avg: 3100, med: 2900 }, // Nob Hill/Polk
  "94110": { avg: 3000, med: 2800 }, // Mission
  "94111": { avg: 3600, med: 3400 }, // Embarcadero
  "94112": { avg: 2400, med: 2200 }, // Excelsior/Outer Mission
  "94114": { avg: 3300, med: 3100 }, // Castro
  "94115": { avg: 3200, med: 3000 }, // Western Addition/Fillmore
  "94116": { avg: 2600, med: 2400 }, // Sunset
  "94117": { avg: 3100, med: 2900 }, // Haight
  "94118": { avg: 2900, med: 2700 }, // Inner Richmond
  "94121": { avg: 2500, med: 2300 }, // Outer Richmond
  "94122": { avg: 2700, med: 2500 }, // Sunset
  "94123": { avg: 3400, med: 3200 }, // Marina
  "94124": { avg: 2200, med: 2000 }, // Bayview
  "94127": { avg: 2800, med: 2600 }, // St. Francis Wood
  "94131": { avg: 3000, med: 2800 }, // Twin Peaks/Glen Park
  "94132": { avg: 2500, med: 2300 }, // Lake Merced
  "94133": { avg: 2800, med: 2600 }, // North Beach/Telegraph Hill
  "94134": { avg: 2300, med: 2100 }, // Visitacion Valley
  "94158": { avg: 3700, med: 3500 }, // Mission Bay
};

function getMockRentData(zipcode: string): RentcastData {
  const estimate = SF_RENT_ESTIMATES[zipcode] || { avg: 2800, med: 2600 };
  const variance = 0.15;
  return {
    zipcode,
    averageRent: estimate.avg,
    medianRent: estimate.med,
    minRent: Math.round(estimate.med * (1 - variance)),
    maxRent: Math.round(estimate.avg * (1 + variance * 2)),
    listingCount: 15 + Math.round(Math.abs(parseInt(zipcode) % 30)),
  };
}

export async function fetchMarketRentsForZipcodes(
  zipcodes: string[],
): Promise<Map<string, RentcastData>> {
  const results = new Map<string, RentcastData>();
  const uniqueZips = [...new Set(zipcodes)];

  // RentCast free tier: 50 calls/month — be very conservative
  const maxCalls = Math.min(uniqueZips.length, 10);

  for (let i = 0; i < maxCalls; i++) {
    const data = await fetchMarketRent(uniqueZips[i]);
    if (data) {
      results.set(uniqueZips[i], data);
    }

    // 1 second delay between calls
    await new Promise((r) => setTimeout(r, 1000));
  }

  log.info(
    { fetched: results.size, total: uniqueZips.length },
    "Fetched RentCast market data",
  );
  return results;
}
