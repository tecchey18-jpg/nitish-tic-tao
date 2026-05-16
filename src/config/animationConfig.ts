export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 28 },
  soft: { type: 'spring', stiffness: 210, damping: 24 },
  bounce: { type: 'spring', stiffness: 520, damping: 18 }
} as const;

export const durations = {
  fast: 0.16,
  base: 0.28,
  cinematic: 0.75
} as const;
