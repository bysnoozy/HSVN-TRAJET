import { DEMO_STATIONS, getDemoDepartures } from "./demoData";
import { getIdfmDepartures, searchIdfmStations } from "./idfm";
import { getSncfDepartures, searchSncfStations } from "./sncf";
import type { ApiKeys, Departure, Provider, StationResult } from "./types";

export type { ApiKeys };

export function hasAnyApiKey(keys: ApiKeys): boolean {
  return Boolean(keys.sncf || keys.idfm);
}

export async function searchStations(query: string, keys: ApiKeys): Promise<StationResult[]> {
  if (!hasAnyApiKey(keys)) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return DEMO_STATIONS.filter((s) => s.name.toLowerCase().includes(normalized));
  }

  const [sncfResults, idfmResults] = await Promise.all([
    keys.sncf ? searchSncfStations(query, keys.sncf).catch(() => []) : Promise.resolve([]),
    keys.idfm ? searchIdfmStations(query, keys.idfm).catch(() => []) : Promise.resolve([]),
  ]);
  return [...sncfResults, ...idfmResults];
}

export async function getDepartures(provider: Provider, stationId: string, keys: ApiKeys): Promise<Departure[]> {
  if (provider === "sncf") {
    if (!keys.sncf) return getDemoDepartures(stationId);
    return getSncfDepartures(stationId, keys.sncf);
  }
  if (!keys.idfm) return getDemoDepartures(stationId);
  return getIdfmDepartures(stationId, keys.idfm);
}
