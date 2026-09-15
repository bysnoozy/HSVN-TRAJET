export function formatClockTime(iso: string): string {
  if (!iso) return "--:--";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function minutesUntil(iso: string): number {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.round((date.getTime() - Date.now()) / 60_000));
}

export function formatCountdown(iso: string): string {
  const minutes = minutesUntil(iso);
  if (minutes <= 0) return "À quai";
  if (minutes === 1) return "1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}
