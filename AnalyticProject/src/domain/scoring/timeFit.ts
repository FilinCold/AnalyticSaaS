/** TimeFit: ≤10→100, ≤12→85, ≤14→70, else 0 */
export function computeTimeFitScore(estimatedBuildDays: number): number {
  if (estimatedBuildDays <= 10) return 100;
  if (estimatedBuildDays <= 12) return 85;
  if (estimatedBuildDays <= 14) return 70;
  return 0;
}
