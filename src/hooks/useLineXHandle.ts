import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LINE_X_ACCOUNTS, normalizeLineName } from "../constants/lineXAccounts";

const OVERRIDES_KEY = "hsvn.lineXAccountOverrides";

async function loadOverrides(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(OVERRIDES_KEY);
  return raw ? JSON.parse(raw) : {};
}

/**
 * Résout le compte X d'une ligne : d'abord une éventuelle correction locale
 * (mémorisée sur l'appareil, prioritaire — la table par défaut n'est pas
 * garantie exacte), sinon la table de démarrage.
 */
export function useLineXHandle(line: string, mode?: string) {
  const key = normalizeLineName(line, mode);
  const [handle, setHandleState] = useState<string | undefined>(DEFAULT_LINE_X_ACCOUNTS[key]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const overrides = await loadOverrides();
      if (cancelled) return;
      setHandleState(overrides[key] ?? DEFAULT_LINE_X_ACCOUNTS[key]);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const setHandle = useCallback(
    async (newHandle: string) => {
      const overrides = await loadOverrides();
      const cleaned = newHandle.trim().replace(/^@/, "");
      overrides[key] = cleaned;
      await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
      setHandleState(cleaned);
    },
    [key]
  );

  return { handle, loaded, setHandle };
}
