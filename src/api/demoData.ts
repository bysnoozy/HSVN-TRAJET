import type { Departure, StationResult } from "./types";

/**
 * Données factices utilisées tant qu'aucune clé API (SNCF et/ou IDFM) n'est
 * configurée dans l'écran Réglages, pour que l'app soit utilisable dès le
 * premier lancement.
 */
export const DEMO_STATIONS: StationResult[] = [
  { id: "demo:gare-de-lyon", provider: "sncf", name: "Paris Gare de Lyon", city: "Paris", mode: "train" },
  { id: "demo:gare-du-nord", provider: "sncf", name: "Paris Gare du Nord", city: "Paris", mode: "train" },
  { id: "demo:gare-montparnasse", provider: "sncf", name: "Paris Montparnasse", city: "Paris", mode: "train" },
  { id: "demo:chatelet", provider: "idfm", name: "Châtelet - Les Halles", city: "Paris", mode: "metro" },
  { id: "demo:nation", provider: "idfm", name: "Nation", city: "Paris", mode: "metro" },
  { id: "demo:la-defense", provider: "idfm", name: "La Défense", city: "Puteaux", mode: "rer" },
];

const LINES: Array<{ line: string; mode: Departure["mode"] }> = [
  { line: "TGV INOUI", mode: "train" },
  { line: "RER A", mode: "rer" },
  { line: "RER B", mode: "rer" },
  { line: "M1", mode: "metro" },
  { line: "M4", mode: "metro" },
  { line: "Transilien H", mode: "train" },
];

const DESTINATIONS = [
  "Lyon Part-Dieu",
  "Marne-la-Vallée Chessy",
  "Châtelet-Les Halles",
  "La Défense",
  "Mantes-la-Jolie",
  "Boissy-Saint-Léger",
];

export function getDemoDepartures(stationId: string): Departure[] {
  const now = Date.now();
  return Array.from({ length: 8 }).map((_, i) => {
    const { line, mode } = LINES[i % LINES.length];
    const delay = i % 3 === 0 ? 0 : (i % 5) * 2;
    const scheduled = new Date(now + (i + 1) * 4 * 60_000);
    const expected = new Date(scheduled.getTime() + delay * 60_000);
    return {
      id: `${stationId}-demo-${i}`,
      line,
      mode,
      destination: DESTINATIONS[i % DESTINATIONS.length],
      scheduledTime: scheduled.toISOString(),
      expectedTime: expected.toISOString(),
      platform: String(1 + (i % 6)),
      delayMinutes: delay,
      status: delay === 0 ? "on_time" : "delayed",
    };
  });
}
