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
    log.warn("No Walk Score API key — using mock data");
    return getMockWalkScore(lat, lng);
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

function getMockWalkScore(lat: number, lng: number): WalkScoreData {
  // SF neighborhoods generally have high walk/transit scores
  // Vary by location: downtown areas higher, outer neighborhoods lower
  const distFromDowntown = Math.sqrt(
    Math.pow(lat - 37.7849, 2) + Math.pow(lng - (-122.4094), 2),
  );
  const proximity = Math.max(0, 1 - distFromDowntown * 30); // 0-1 scale
  const walkScore = Math.round(60 + proximity * 35); // 60-95
  const transitScore = Math.round(55 + proximity * 40); // 55-95
  const bikeScore = Math.round(50 + proximity * 30); // 50-80
  const desc = walkScore >= 90 ? "Walker's Paradise" : walkScore >= 70 ? "Very Walkable" : "Somewhat Walkable";
  return { walkScore, transitScore, bikeScore, description: desc };
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
