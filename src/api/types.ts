export type Provider = "sncf" | "idfm";

export type TransportMode = "train" | "rer" | "metro" | "tram" | "bus" | "autre";

export interface StationResult {
  id: string;
  provider: Provider;
  name: string;
  city?: string;
  mode: TransportMode;
}

export type DepartureStatus = "on_time" | "delayed" | "cancelled" | "unknown";

export interface Departure {
  id: string;
  line: string;
  mode: TransportMode;
  destination: string;
  scheduledTime: string;
  expectedTime: string;
  platform?: string;
  delayMinutes: number;
  status: DepartureStatus;
}

export interface Favorite {
  key: string;
  provider: Provider;
  stationId: string;
  name: string;
  city?: string;
  mode: TransportMode;
}

export interface ApiKeys {
  sncf?: string;
  idfm?: string;
}
