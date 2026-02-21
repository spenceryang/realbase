import { config } from "../../core/config.js";
import { createChildLogger } from "../../core/logger.js";

const log = createChildLogger("data:crime");

const SF_CRIME_ENDPOINT =
  "https://data.sfgov.org/resource/wg3w-h783.json";

interface CrimeIncident {
  incident_datetime: string;
  incident_category: string;
  incident_description: string;
  latitude: string;
  longitude: string;
  police_district: string;
  analysis_neighborhood: string;
}

export interface CrimeData {
  neighborhood: string;
  incidentCount: number;
  incidents: CrimeIncident[];
}

export async function fetchCrimeData(): Promise<Map<string, CrimeData>> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const dateFilter = ninetyDaysAgo.toISOString().split("T")[0];

  const params = new URLSearchParams({
    $where: `incident_datetime > '${dateFilter}'`,
    $limit: "50000",
    $select:
      "incident_datetime,incident_category,incident_description,latitude,longitude,police_district,analysis_neighborhood",
  });

  if (config.SOCRATA_APP_TOKEN) {
    params.set("$$app_token", config.SOCRATA_APP_TOKEN);
  }

  const url = `${SF_CRIME_ENDPOINT}?${params}`;

  try {
    log.info("Fetching SF crime data from Socrata...");
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Socrata API error: ${response.status}`);
    }

    const incidents: CrimeIncident[] = await response.json();
    log.info({ count: incidents.length }, "Fetched crime incidents");

    // Group by neighborhood
    const byNeighborhood = new Map<string, CrimeData>();

    for (const incident of incidents) {
      const hood = incident.analysis_neighborhood || "Unknown";
      if (!byNeighborhood.has(hood)) {
        byNeighborhood.set(hood, {
          neighborhood: hood,
          incidentCount: 0,
          incidents: [],
        });
      }
      const data = byNeighborhood.get(hood)!;
      data.incidentCount++;
      data.incidents.push(incident);
    }

    return byNeighborhood;
  } catch (error) {
    log.error({ error }, "Failed to fetch crime data");
    return new Map();
  }
}
