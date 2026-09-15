import type { Departure, StationResult, TransportMode } from "./types";

/**
 * Client pour l'API PRIM d'Île-de-France Mobilités (SIRI Lite). Documentation
 * & inscription : https://prim.iledefrance-mobilites.fr/
 *
 * Authentification : header `apikey`.
 * NB : vérifiez les chemins d'API ci-dessous par rapport à la documentation
 * actuelle avant mise en production — les API publiques évoluent.
 */
const IDFM_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace";

function authHeader(apiKey: string): HeadersInit {
  return { apikey: apiKey, Accept: "application/json" };
}

async function idfmFetch(path: string, apiKey: string): Promise<any> {
  const res = await fetch(`${IDFM_BASE_URL}${path}`, { headers: authHeader(apiKey) });
  if (!res.ok) {
    throw new Error(`IDFM API error (${res.status}) sur ${path}`);
  }
  return res.json();
}

function mapVehicleMode(mode?: string): TransportMode {
  const normalized = (mode ?? "").toLowerCase();
  if (normalized.includes("rail")) return "train";
  if (normalized.includes("rer")) return "rer";
  if (normalized.includes("metro")) return "metro";
  if (normalized.includes("tram")) return "tram";
  if (normalized.includes("bus") || normalized.includes("coach")) return "bus";
  return "autre";
}

export async function searchIdfmStations(query: string, apiKey: string): Promise<StationResult[]> {
  if (!query.trim() || !apiKey) return [];
  const data = await idfmFetch(`/stops-discovery?q=${encodeURIComponent(query)}`, apiKey);
  const locations: any[] =
    data?.LocationInformationDelivery?.AnnotatedStopPointRef ?? data?.stopPoints ?? data?.Siri?.stopPoints ?? [];
  return locations.map((l) => ({
    id: (l.StopPointRef ?? l.id) as string,
    provider: "idfm" as const,
    name: (l.StopName ?? l.name) as string,
    city: undefined,
    mode: mapVehicleMode(l.Mode ?? l.mode),
  }));
}

export async function getIdfmDepartures(stopPointRef: string, apiKey: string): Promise<Departure[]> {
  const data = await idfmFetch(`/stop-monitoring?MonitoringRef=${encodeURIComponent(stopPointRef)}`, apiKey);
  const visits: any[] = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit ?? [];
  return visits.map((v, idx) => {
    const mvj = v.MonitoredVehicleJourney ?? {};
    const call = mvj.MonitoredCall ?? {};
    const scheduled = call.AimedDepartureTime ?? call.AimedArrivalTime;
    const expected = call.ExpectedDepartureTime ?? call.ExpectedArrivalTime ?? scheduled;
    const scheduledDate = scheduled ? new Date(scheduled) : new Date();
    const expectedDate = expected ? new Date(expected) : scheduledDate;
    const delayMinutes = Math.round((expectedDate.getTime() - scheduledDate.getTime()) / 60_000);
    const cancelled = call.DepartureStatus === "cancelled" || call.ArrivalStatus === "cancelled";
    return {
      id: `idfm-${stopPointRef}-${idx}`,
      line: mvj.PublishedLineName?.[0]?.value ?? mvj.LineRef?.value ?? "Ligne",
      mode: mapVehicleMode(mvj.VehicleMode?.[0]),
      destination: mvj.DestinationName?.[0]?.value ?? "Destination inconnue",
      scheduledTime: scheduledDate.toISOString(),
      expectedTime: expectedDate.toISOString(),
      platform: call.DeparturePlatformName?.value ?? call.ArrivalPlatformName?.value,
      delayMinutes,
      status: cancelled ? "cancelled" : delayMinutes > 1 ? "delayed" : "on_time",
    } satisfies Departure;
  });
}
