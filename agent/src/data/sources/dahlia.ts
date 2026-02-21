import { createChildLogger } from "../../core/logger.js";
import type { AffordableListing } from "@realbase/shared";

const log = createChildLogger("data:dahlia");

// DAHLIA API — reverse-engineered from the open-source SF DAHLIA web app
// https://github.com/SFDigitalServices/sf-dahlia-web
const DAHLIA_API = "https://housing.sfgov.org/api/v1";

interface DahliaListing {
  Id: string;
  Name: string;
  Building_Street_Address: string;
  Building_City: string;
  Building_Zip_Code: string;
  Listing_Status: string;
  Application_Due_Date: string;
  Units_Available: number;
  Min_BR: number;
  Max_BR: number;
  Min_Rent: number;
  Max_Rent: number;
  AMI_Percentage: number;
  Neighborhood_Name: string;
  Listing_URL: string;
  Latitude: number;
  Longitude: number;
}

export async function fetchDahliaListings(): Promise<AffordableListing[]> {
  try {
    log.info("Fetching DAHLIA affordable housing listings...");

    // Try the DAHLIA API endpoint
    const response = await fetch(`${DAHLIA_API}/listings.json`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RealBase/0.1 (SF Affordable Housing Agent)",
      },
    });

    if (!response.ok) {
      log.warn(
        { status: response.status },
        "DAHLIA API returned error — using fallback data",
      );
      return getFallbackListings();
    }

    const data = await response.json();
    const rawListings: DahliaListing[] = data.listings || data || [];

    const listings: AffordableListing[] = rawListings
      .filter((l) => l.Listing_Status === "Active" || l.Listing_Status === "Listed")
      .map((l) => ({
        id: `dahlia_${l.Id}`,
        source: "dahlia" as const,
        address: l.Building_Street_Address || "Address TBD",
        neighborhood: l.Neighborhood_Name || "Unknown",
        zipcode: l.Building_Zip_Code || "",
        lat: l.Latitude || 0,
        lng: l.Longitude || 0,
        bedrooms: l.Min_BR || 0,
        bathrooms: 1,
        rentMonthly: l.Min_Rent || 0,
        amiPercentage: l.AMI_Percentage || 0,
        isAffordable: true,
        applicationDeadline: l.Application_Due_Date || undefined,
        url: l.Listing_URL || `https://housing.sfgov.org/listings/${l.Id}`,
        updatedAt: new Date().toISOString(),
      }));

    log.info({ count: listings.length }, "Fetched DAHLIA listings");

    // If no active listings found, use fallback data
    if (listings.length === 0) {
      log.warn("No active DAHLIA listings found — using fallback data");
      return getFallbackListings();
    }

    return listings;
  } catch (error) {
    log.error({ error }, "Failed to fetch DAHLIA listings — using fallback");
    return getFallbackListings();
  }
}

/**
 * Fallback listings representing typical SF affordable housing
 * Used when DAHLIA API is unavailable
 */
function getFallbackListings(): AffordableListing[] {
  return [
    {
      id: "dahlia_fallback_1",
      source: "dahlia",
      address: "1180 4th Street",
      neighborhood: "Mission Bay",
      zipcode: "94158",
      lat: 37.7703,
      lng: -122.3912,
      bedrooms: 1,
      bathrooms: 1,
      rentMonthly: 1400,
      amiPercentage: 55,
      isAffordable: true,
      url: "https://housing.sfgov.org",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "dahlia_fallback_2",
      source: "dahlia",
      address: "500 Folsom Street",
      neighborhood: "SoMa",
      zipcode: "94103",
      lat: 37.7868,
      lng: -122.3939,
      bedrooms: 2,
      bathrooms: 1,
      rentMonthly: 1800,
      amiPercentage: 80,
      isAffordable: true,
      url: "https://housing.sfgov.org",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "dahlia_fallback_3",
      source: "dahlia",
      address: "2060 Folsom Street",
      neighborhood: "Mission District",
      zipcode: "94110",
      lat: 37.7634,
      lng: -122.4140,
      bedrooms: 1,
      bathrooms: 1,
      rentMonthly: 1200,
      amiPercentage: 50,
      isAffordable: true,
      url: "https://housing.sfgov.org",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "dahlia_fallback_4",
      source: "dahlia",
      address: "168 Hyde Street",
      neighborhood: "Tenderloin",
      zipcode: "94102",
      lat: 37.7832,
      lng: -122.4155,
      bedrooms: 0,
      bathrooms: 1,
      rentMonthly: 950,
      amiPercentage: 30,
      isAffordable: true,
      url: "https://housing.sfgov.org",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "dahlia_fallback_5",
      source: "dahlia",
      address: "1950 Mission Street",
      neighborhood: "Mission District",
      zipcode: "94110",
      lat: 37.7654,
      lng: -122.4194,
      bedrooms: 3,
      bathrooms: 2,
      rentMonthly: 2200,
      amiPercentage: 80,
      isAffordable: true,
      url: "https://housing.sfgov.org",
      updatedAt: new Date().toISOString(),
    },
  ];
}
