import { config } from "../../core/config.js";
import { createChildLogger } from "../../core/logger.js";

const log = createChildLogger("data:walkscore");

const WALKSCORE_API = "https://api.walkscore.com/score";

export interface WalkScoreData {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  description: string;
}

export async function fetchWalkScore(
  lat: number,
  lng: number,
  address = "San Francisco, CA",
): Promise<WalkScoreData | null> {
  if (!config.WALKSCORE_API_KEY) {
    log.warn("No Walk Score API key — returning null");
    return null;
  }

  const params = new URLSearchParams({
    format: "json",
    lat: lat.toString(),
    lon: lng.toString(),
    transit: "1",
    bike: "1",
    wsapikey: config.WALKSCORE_API_KEY,
    address,
  });

  try {
    const response = await fetch(`${WALKSCORE_API}?${params}`);

    if (!response.ok) {
      throw new Error(`Walk Score API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 1) {
      log.warn({ status: data.status }, "Walk Score returned non-success");
      return null;
    }

    return {
      walkScore: data.walkscore || 0,
      transitScore: data.transit?.score || 0,
      bikeScore: data.bike?.score || 0,
      description: data.description || "",
    };
  } catch (error) {
    log.error({ error, lat, lng }, "Failed to fetch Walk Score");
    return null;
  }
}

export async function fetchWalkScoresForNeighborhoods(
  locations: Array<{ zipcode: string; name: string; lat: number; lng: number }>,
): Promise<Map<string, WalkScoreData>> {
  const results = new Map<string, WalkScoreData>();

  for (const loc of locations) {
    const score = await fetchWalkScore(
      loc.lat,
      loc.lng,
      `${loc.name}, San Francisco, CA`,
    );
    if (score) {
      results.set(loc.zipcode, score);
    }

    // Rate limit: be conservative, 200ms between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  log.info(
    { neighborhoods: results.size },
    "Fetched Walk Scores for neighborhoods",
  );
  return results;
}
