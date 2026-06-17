/**
 * The ToolStack test-score system. Every review carries four sub-scores
 * (0–10, from the rubric on /how-we-test); the overall score is their mean.
 */
export interface Scores {
  easeOfUse: number;
  value: number;
  features: number;
  support: number;
}

export const SCORE_LABELS: Record<keyof Scores, string> = {
  easeOfUse: 'Ease of use',
  value: 'Value for money',
  features: 'Features',
  support: 'Support',
};

/** Overall score: mean of sub-scores, one decimal (e.g. 8.4). */
export function overallScore(scores: Scores): number {
  const values = Object.values(scores);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round(mean * 10) / 10;
}

/** Always render with one decimal — "8.0", not "8". */
export function formatScore(score: number): string {
  return score.toFixed(1);
}
