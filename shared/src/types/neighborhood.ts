export interface NeighborhoodScore {
  zipcode: string;
  name: string;
  compositeScore: number; // 0-10
  schoolScore: number; // 0-10
  safetyScore: number; // 0-10
  transitScore: number; // 0-10
  walkabilityScore: number; // 0-10
  affordabilityScore: number; // 0-10
  updatedAt: string; // ISO timestamp
}

export interface NeighborhoodData {
  zipcode: string;
  name: string;
  lat: number;
  lng: number;
  schools: SchoolInfo[];
  crimeCount90d: number;
  crimePerSqMile: number;
  walkScore: number;
  transitScoreRaw: number;
  bikeScore: number;
  medianIncome: number;
  medianRent: number;
  population: number;
}

export interface SchoolInfo {
  name: string;
  rating: number; // 1-10
  gradeRange: string;
  distance: number; // miles
  type: "public" | "private" | "charter";
}

export interface NeighborhoodComparison {
  neighborhoods: NeighborhoodScore[];
  recommendation: string;
}
