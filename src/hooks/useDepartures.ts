import { useCallback, useEffect, useRef, useState } from "react";
import { getDepartures } from "../api/search";
import type { ApiKeys, Departure, Provider } from "../api/types";

const REFRESH_INTERVAL_MS = 30_000;

export function useDepartures(provider: Provider, stationId: string, keys: ApiKeys) {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getDepartures(provider, stationId, keys);
      setDepartures(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [provider, stationId, keys]);

  useEffect(() => {
    setLoading(true);
    load();
    timerRef.current = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  return { departures, loading, error, refresh: load };
}
