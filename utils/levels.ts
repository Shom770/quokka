export function getMilestoneThreshold(level: number): number {
  if (level === 1) return 100;
  if (level === 2) return 250;
  if (level === 3) return 500;
  if (level === 4) return 1000;
  return 1000 + 1000 * (level - 4);
}

export function getMilestones(points: number): {
  level: number;
  prevThreshold: number;
  nextThreshold: number;
  progress: number;
} {
  let level = 1;
  let prevThreshold = 0;
  let nextThreshold = getMilestoneThreshold(1);

  while (points >= nextThreshold) {
    level += 1;
    prevThreshold = nextThreshold;
    nextThreshold = getMilestoneThreshold(level);
  }

  const span = nextThreshold - prevThreshold || 1;
  const progress = Math.min(
    1,
    Math.max(0, (points - prevThreshold) / span)
  );

  return { level, prevThreshold, nextThreshold, progress };
}
