import { useCallback, useEffect, useState } from "react";
import type { ApiKeys } from "../api/types";
import { getSecureItem, setSecureItem } from "../utils/storage";

const SNCF_STORAGE_KEY = "hsvn.apiKey.sncf";
const IDFM_STORAGE_KEY = "hsvn.apiKey.idfm";

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sncf, idfm] = await Promise.all([
        getSecureItem(SNCF_STORAGE_KEY),
        getSecureItem(IDFM_STORAGE_KEY),
      ]);
      if (cancelled) return;
      setKeys({ sncf: sncf ?? undefined, idfm: idfm ?? undefined });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveKeys = useCallback(async (next: ApiKeys) => {
    if (next.sncf !== undefined) await setSecureItem(SNCF_STORAGE_KEY, next.sncf);
    if (next.idfm !== undefined) await setSecureItem(IDFM_STORAGE_KEY, next.idfm);
    setKeys((prev) => ({ ...prev, ...next }));
  }, []);

  return { keys, loaded, saveKeys };
}
