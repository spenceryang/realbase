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
    log.warn("No RentCast API key — returning null");
    return null;
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
