import { config } from "../../core/config.js";
import { createChildLogger } from "../../core/logger.js";
import type { SchoolInfo } from "@realbase/shared";

const log = createChildLogger("data:greatschools");

const GREATSCHOOLS_API = "https://gs-api.greatschools.org/api/v2";

interface GSSchool {
  name: string;
  gsRating: number;
  gradeRange: string;
  distance: number;
  schoolType: string;
}

export async function fetchSchoolsNearby(
  lat: number,
  lng: number,
  radiusMiles = 1,
): Promise<SchoolInfo[]> {
  if (!config.GREATSCHOOLS_API_KEY) {
    log.warn("No GreatSchools API key — using mock data");
    return getMockSchools(lat, lng);
  }

  const url = `${GREATSCHOOLS_API}/schools?lat=${lat}&lon=${lng}&radius=${radiusMiles}&limit=10`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": config.GREATSCHOOLS_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        log.warn("GreatSchools rate limit hit");
        return [];
      }
      throw new Error(`GreatSchools API error: ${response.status}`);
    }

    const data = await response.json();
    const schools: GSSchool[] = data.schools || data || [];

    return schools
      .filter((s) => s.gsRating > 0)
      .map((s) => ({
        name: s.name,
        rating: s.gsRating,
        gradeRange: s.gradeRange || "N/A",
        distance: s.distance || 0,
        type: mapSchoolType(s.schoolType),
      }));
  } catch (error) {
    log.error({ error, lat, lng }, "Failed to fetch school data");
    return [];
  }
}

function mapSchoolType(
  type: string,
): "public" | "private" | "charter" {
  const t = (type || "").toLowerCase();
  if (t.includes("charter")) return "charter";
  if (t.includes("private")) return "private";
  return "public";
}

function getMockSchools(lat: number, lng: number): SchoolInfo[] {
  // Deterministic mock based on lat/lng to get varied but consistent results
  const seed = Math.abs(Math.round((lat * 1000 + lng * 1000) % 100));
  const baseRating = 4 + (seed % 6); // 4-9 range
  return [
    { name: "SF Elementary", rating: Math.min(baseRating, 10), gradeRange: "K-5", distance: 0.3, type: "public" },
    { name: "Bay Area Middle School", rating: Math.min(baseRating - 1, 10), gradeRange: "6-8", distance: 0.5, type: "public" },
    { name: "Pacific Charter Academy", rating: Math.min(baseRating + 1, 10), gradeRange: "K-8", distance: 0.7, type: "charter" },
  ];
}

export async function fetchSchoolsForNeighborhoods(
  locations: Array<{ zipcode: string; lat: number; lng: number }>,
): Promise<Map<string, SchoolInfo[]>> {
  const results = new Map<string, SchoolInfo[]>();

  // Rate limit: 10 req/sec — process sequentially with delay
  for (const loc of locations) {
    const schools = await fetchSchoolsNearby(loc.lat, loc.lng);
    results.set(loc.zipcode, schools);

    // Respect rate limit: 100ms between requests
    await new Promise((r) => setTimeout(r, 100));
  }

  log.info(
    { neighborhoods: results.size },
    "Fetched schools for all neighborhoods",
  );
  return results;
}
