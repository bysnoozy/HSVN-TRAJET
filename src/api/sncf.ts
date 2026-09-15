import type { Departure, StationResult, TransportMode } from "./types";

/**
 * Client pour l'API SNCF (basée sur Navitia). Documentation & inscription :
 * https://numerique.sncf.com/startup/api/
 *
 * Authentification : HTTP Basic, la clé API sert de login, mot de passe vide.
 * NB : vérifiez les chemins d'API ci-dessous par rapport à la documentation
 * actuelle avant mise en production — les API publiques évoluent.
 */
const SNCF_BASE_URL = "https://api.sncf.com/v1/coverage/sncf";

function authHeader(apiKey: string): HeadersInit {
  return { Authorization: `Basic ${base64Encode(`${apiKey}:`)}` };
}

function base64Encode(value: string): string {
  if (typeof btoa === "function") return btoa(value);
  // Fallback Node/RN hors environnement web.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require("buffer");
  return Buffer.from(value, "utf-8").toString("base64");
}

function parseNavitiaDate(value?: string): Date | undefined {
  // Format Navitia : "20260915T143000"
  if (!value || value.length < 15) return undefined;
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(
    11,
    13
  )}:${value.slice(13, 15)}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function mapCommercialMode(mode?: string): TransportMode {
  const normalized = (mode ?? "").toLowerCase();
  if (normalized.includes("tgv") || normalized.includes("intercit") || normalized.includes("ouigo")) return "train";
  if (normalized.includes("rer")) return "rer";
  if (normalized.includes("tram")) return "tram";
  if (normalized.includes("bus")) return "bus";
  if (normalized.includes("train") || normalized.includes("transilien")) return "train";
  return "autre";
}

async function sncfFetch(path: string, apiKey: string): Promise<any> {
  const res = await fetch(`${SNCF_BASE_URL}${path}`, { headers: authHeader(apiKey) });
  if (!res.ok) {
    throw new Error(`SNCF API error (${res.status}) sur ${path}`);
  }
  return res.json();
}

export async function searchSncfStations(query: string, apiKey: string): Promise<StationResult[]> {
  if (!query.trim() || !apiKey) return [];
  const data = await sncfFetch(`/places?q=${encodeURIComponent(query)}&type[]=stop_area&count=10`, apiKey);
  const places: any[] = data.places ?? [];
  return places
    .filter((p) => p.embedded_type === "stop_area")
    .map((p) => ({
      id: p.id as string,
      provider: "sncf" as const,
      name: (p.stop_area?.name ?? p.name) as string,
      city: p.stop_area?.administrative_regions?.[0]?.name as string | undefined,
      mode: "train" as const,
    }));
}

export async function getSncfDepartures(stopAreaId: string, apiKey: string): Promise<Departure[]> {
  const data = await sncfFetch(`/stop_areas/${encodeURIComponent(stopAreaId)}/departures?count=20`, apiKey);
  const departures: any[] = data.departures ?? [];
  return departures.map((d, idx) => {
    const sdt = d.stop_date_time ?? {};
    const scheduled = parseNavitiaDate(sdt.base_departure_date_time ?? sdt.departure_date_time);
    const expected = parseNavitiaDate(sdt.departure_date_time ?? sdt.base_departure_date_time);
    const delayMinutes =
      scheduled && expected ? Math.round((expected.getTime() - scheduled.getTime()) / 60_000) : 0;
    const info = d.display_informations ?? {};
    const isRealtime = sdt.data_freshness === "realtime";
    return {
      id: `sncf-${stopAreaId}-${idx}`,
      line: info.headsign ? `${info.commercial_mode ?? ""} ${info.headsign}`.trim() : (info.commercial_mode ?? "Train"),
      mode: mapCommercialMode(info.commercial_mode),
      destination: info.direction ?? "Destination inconnue",
      scheduledTime: (scheduled ?? new Date()).toISOString(),
      expectedTime: (expected ?? scheduled ?? new Date()).toISOString(),
      platform: d.stop_point?.platform_code ?? undefined,
      delayMinutes,
      status: !isRealtime ? "unknown" : delayMinutes > 1 ? "delayed" : "on_time",
    } satisfies Departure;
  });
}
