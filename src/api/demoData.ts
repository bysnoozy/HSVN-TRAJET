import type { Departure, StationResult, TransportMode } from "./types";

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
  { id: "demo:esbly", provider: "sncf", name: "Esbly", city: "Esbly", mode: "train" },
  { id: "demo:chelles", provider: "sncf", name: "Chelles - Gournay", city: "Chelles", mode: "train" },
  { id: "demo:porte-maillot", provider: "idfm", name: "Porte Maillot", city: "Paris", mode: "rer" },
  { id: "demo:esplanade-defense", provider: "idfm", name: "Esplanade de la Défense", city: "Puteaux", mode: "metro" },
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

/**
 * Passages "réalistes" pour quelques arrêts précis, afin d'illustrer un vrai
 * trajet multi-étapes en mode démo (ex: Esbly → Chelles [Ligne P] → Porte
 * Maillot [RER E] → Esplanade de la Défense [métro 1], et son retour).
 */
const ROUTE_DEPARTURES: Record<string, Array<{ line: string; mode: TransportMode; destination: string }>> = {
  "demo:esbly": [
    { line: "Ligne P", mode: "train", destination: "Chelles - Gournay" },
    { line: "Ligne P", mode: "train", destination: "Paris Est" },
  ],
  "demo:chelles": [
    { line: "RER E", mode: "rer", destination: "Porte Maillot" },
    { line: "Ligne P", mode: "train", destination: "Esbly" },
    { line: "RER E", mode: "rer", destination: "Tournan" },
  ],
  "demo:porte-maillot": [
    { line: "M1", mode: "metro", destination: "Esplanade de la Défense" },
    { line: "RER E", mode: "rer", destination: "Chelles - Gournay" },
    { line: "M1", mode: "metro", destination: "Château de Vincennes" },
  ],
  "demo:esplanade-defense": [
    { line: "M1", mode: "metro", destination: "Porte Maillot" },
    { line: "M1", mode: "metro", destination: "La Défense" },
  ],
};

export function getDemoDepartures(stationId: string): Departure[] {
  const now = Date.now();
  const routePool = ROUTE_DEPARTURES[stationId];
  return Array.from({ length: 8 }).map((_, i) => {
    const { line, mode, destination } = routePool
      ? routePool[i % routePool.length]
      : { ...LINES[i % LINES.length], destination: DESTINATIONS[i % DESTINATIONS.length] };
    const delay = i % 3 === 0 ? 0 : (i % 5) * 2;
    const scheduled = new Date(now + (i + 1) * 4 * 60_000);
    const expected = new Date(scheduled.getTime() + delay * 60_000);
    return {
      id: `${stationId}-demo-${i}`,
      line,
      mode,
      destination,
      scheduledTime: scheduled.toISOString(),
      expectedTime: expected.toISOString(),
      platform: String(1 + (i % 6)),
      delayMinutes: delay,
      status: delay === 0 ? "on_time" : "delayed",
    };
  });
}
