export const FIVE_MINUTES_MS = 5 * 60 * 1_000;

export interface SlaSnapshot {
  targetMs: number;
  elapsedMs: number;
  remainingMs: number;
  breached: boolean;
}

export function getSlaSnapshot(startedAt: number, now = Date.now()): SlaSnapshot {
  const elapsedMs = Math.max(0, now - startedAt);
  const remainingMs = FIVE_MINUTES_MS - elapsedMs;
  return {
    targetMs: FIVE_MINUTES_MS,
    elapsedMs,
    remainingMs,
    breached: remainingMs < 0,
  };
}
