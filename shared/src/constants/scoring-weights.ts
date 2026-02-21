export const SCORING_WEIGHTS = {
  school: 0.25,
  safety: 0.25,
  transit: 0.20,
  walkability: 0.15,
  affordability: 0.15,
} as const;

export const SCORE_MIN = 0;
export const SCORE_MAX = 10;
