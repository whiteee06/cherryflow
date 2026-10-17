export function formatSecondsToHM(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

export function formatStopwatchTime(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remSecs = secs % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(remSecs)}`;
  }
  return `${pad(mins)}:${pad(remSecs)}`;
}

export function calculateLiveTimerSeconds(timerStartedAt?: string, baseTimeSpentSeconds: number = 0): number {
  if (!timerStartedAt) return baseTimeSpentSeconds;
  const startMs = new Date(timerStartedAt).getTime();
  const elapsedMs = Math.max(0, Date.now() - startMs);
  return baseTimeSpentSeconds + Math.floor(elapsedMs / 1000);
}
