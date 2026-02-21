import { config } from "../../core/config.js";
import { createChildLogger } from "../../core/logger.js";

const log = createChildLogger("data:census");

const CENSUS_API = "https://api.census.gov/data";

export interface CensusData {
  zipcode: string;
  medianIncome: number;
  medianRent: number;
  population: number;
  povertyRate: number;
}

/**
 * Fetch ACS 5-year estimates for SF zip codes.
 * Variables:
 *  B19013_001E = Median household income
 *  B25064_001E = Median gross rent
 *  B01003_001E = Total population
 *  B17001_002E = Population below poverty level
 */
export async function fetchCensusData(
  zipcodes: string[],
): Promise<Map<string, CensusData>> {
  if (!config.CENSUS_API_KEY) {
    log.warn("No Census API key — returning mock data");
    return getMockCensusData(zipcodes);
  }

  const variables =
    "B19013_001E,B25064_001E,B01003_001E,B17001_002E";
  const uniqueZips = [...new Set(zipcodes)];

  const results = new Map<string, CensusData>();

  // Fetch for each zipcode (Census calls them ZCTA)
  const zipList = uniqueZips.join(",");
  const url = `${CENSUS_API}/2022/acs/acs5?get=NAME,${variables}&for=zip%20code%20tabulation%20area:${zipList}&key=${config.CENSUS_API_KEY}`;

  try {
    log.info("Fetching Census ACS data...");
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }

    const data: string[][] = await response.json();
    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);

    for (const row of rows) {
      const zipcode = row[headers.indexOf("zip code tabulation area")];
      const medianIncome = parseInt(row[headers.indexOf("B19013_001E")]) || 0;
      const medianRent = parseInt(row[headers.indexOf("B25064_001E")]) || 0;
      const population = parseInt(row[headers.indexOf("B01003_001E")]) || 0;
      const povertyPop = parseInt(row[headers.indexOf("B17001_002E")]) || 0;

      results.set(zipcode, {
        zipcode,
        medianIncome,
        medianRent,
        population,
        povertyRate: population > 0 ? povertyPop / population : 0,
      });
    }

    log.info({ zipcodes: results.size }, "Fetched Census data");
  } catch (error) {
    log.error({ error }, "Failed to fetch Census data, using mock data");
    return getMockCensusData(zipcodes);
  }

  return results;
}

function getMockCensusData(zipcodes: string[]): Map<string, CensusData> {
  const results = new Map<string, CensusData>();

  // Realistic SF median values for fallback
  const sfMedianIncome = 112_449;
  const sfMedianRent = 2_100;
  const sfAvgPopPerZip = 25_000;

  for (const zip of [...new Set(zipcodes)]) {
    // Add some variation based on zipcode for realism
    const variation = (parseInt(zip.slice(-2)) / 100 - 0.5) * 0.3;
    results.set(zip, {
      zipcode: zip,
      medianIncome: Math.round(sfMedianIncome * (1 + variation)),
      medianRent: Math.round(sfMedianRent * (1 + variation * 0.5)),
      population: Math.round(sfAvgPopPerZip * (1 + variation * 0.2)),
      povertyRate: Math.max(0.05, 0.12 - variation * 0.1),
    });
  }

  return results;
}
