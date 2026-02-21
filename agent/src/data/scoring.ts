import { SCORING_WEIGHTS, SCORE_MAX } from "@realbase/shared";

interface ScoringInput {
  avgSchoolRating: number; // 0-10 from GreatSchools
  crimePerSqMile: number; // raw count per sq mile, 90-day
  transitScoreRaw: number; // 0-100 from Walk Score
  walkScoreRaw: number; // 0-100 from Walk Score
  medianIncome: number; // USD annual
  medianRent: number; // USD monthly
}

interface ScoringOutput {
  composite: number; // 0-10
  school: number;
  safety: number;
  transit: number;
  walkability: number;
  affordability: number;
}

/**
 * Compute normalized neighborhood scores.
 *
 * Formula:
 *   composite = school * 0.25 + safety * 0.25 + transit * 0.20
 *             + walkability * 0.15 + affordability * 0.15
 *
 * All sub-scores normalized to 0-10 scale.
 */
export function computeScores(input: ScoringInput): ScoringOutput {
  const school = normalizeSchoolScore(input.avgSchoolRating);
  const safety = normalizeSafetyScore(input.crimePerSqMile);
  const transit = normalizeTransitScore(input.transitScoreRaw);
  const walkability = normalizeWalkabilityScore(input.walkScoreRaw);
  const affordability = normalizeAffordabilityScore(
    input.medianIncome,
    input.medianRent,
  );

  const composite =
    school * SCORING_WEIGHTS.school +
    safety * SCORING_WEIGHTS.safety +
    transit * SCORING_WEIGHTS.transit +
    walkability * SCORING_WEIGHTS.walkability +
    affordability * SCORING_WEIGHTS.affordability;

  return {
    composite: round(composite),
    school: round(school),
    safety: round(safety),
    transit: round(transit),
    walkability: round(walkability),
    affordability: round(affordability),
  };
}

// School: GreatSchools rating is already 0-10
function normalizeSchoolScore(avgRating: number): number {
  return clamp(avgRating, 0, SCORE_MAX);
}

// Safety: Inverse of crime density. SF average ~150 crimes/sq mile/90 days.
// 0 crimes = 10, 300+ crimes/sq mi = 0
function normalizeSafetyScore(crimePerSqMile: number): number {
  if (crimePerSqMile <= 0) return SCORE_MAX;
  const maxCrime = 300; // crimes/sq mile for score = 0
  const normalized = 1 - crimePerSqMile / maxCrime;
  return clamp(normalized * SCORE_MAX, 0, SCORE_MAX);
}

// Transit: Walk Score transit score is 0-100, normalize to 0-10
function normalizeTransitScore(transitScoreRaw: number): number {
  return clamp(transitScoreRaw / 10, 0, SCORE_MAX);
}

// Walkability: Walk Score is 0-100, normalize to 0-10
function normalizeWalkabilityScore(walkScoreRaw: number): number {
  return clamp(walkScoreRaw / 10, 0, SCORE_MAX);
}

// Affordability: (median income * 30%) / (median rent * 12)
// A ratio >= 1 means median earner can afford median rent at 30% income
// Scale: ratio of 2.0+ = 10, ratio of 0.5 = 0
function normalizeAffordabilityScore(
  medianIncome: number,
  medianRent: number,
): number {
  if (medianIncome <= 0 || medianRent <= 0) return 5; // neutral default

  const annualRent = medianRent * 12;
  const affordableRent = medianIncome * 0.3;
  const ratio = affordableRent / annualRent;

  // Map ratio to 0-10:
  // 0.5 → 0, 1.0 → 5, 1.5 → 7.5, 2.0+ → 10
  const normalized = (ratio - 0.5) / 1.5; // 0.5→0, 2.0→1.0
  return clamp(normalized * SCORE_MAX, 0, SCORE_MAX);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
