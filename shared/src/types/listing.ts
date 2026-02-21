export interface AffordableListing {
  id: string;
  source: "dahlia" | "rentcast" | "manual";
  address: string;
  neighborhood: string;
  zipcode: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  rentMonthly: number;
  amiPercentage?: number; // Below Market Rate AMI %
  isAffordable: boolean; // BMR or below median
  applicationDeadline?: string;
  url?: string;
  updatedAt: string;
}

export interface ListingSearchParams {
  zipcode?: string;
  neighborhood?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  maxRent?: number;
  affordableOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListingSearchResult {
  listings: AffordableListing[];
  total: number;
  neighborhoodScore?: import("./neighborhood.js").NeighborhoodScore;
}
