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

/**
 * Une étape d'un trajet personnel : un arrêt précis, dans un sens précis
 * (ex: "Esbly, vers Chelles"). Le sens correspond à la destination affichée
 * par l'API pour cet arrêt (cf. écran Prochains passages / DirectionFilter).
 */
export interface TrajetStep {
  id: string;
  provider: Provider;
  stationId: string;
  stationName: string;
  direction: string;
  mode: TransportMode;
}

export type TrajetLeg = "aller" | "retour";

export interface Trajet {
  aller: TrajetStep[];
  retour: TrajetStep[];
}
