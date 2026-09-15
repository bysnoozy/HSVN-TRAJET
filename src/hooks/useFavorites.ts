import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { Favorite } from "../api/types";

const FAVORITES_STORAGE_KEY = "hsvn.favorites";

function favoriteKey(provider: Favorite["provider"], stationId: string): string {
  return `${provider}:${stationId}`;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (cancelled) return;
      setFavorites(raw ? (JSON.parse(raw) as Favorite[]) : []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Favorite[]) => {
    setFavorites(next);
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isFavorite = useCallback(
    (provider: Favorite["provider"], stationId: string) =>
      favorites.some((f) => f.key === favoriteKey(provider, stationId)),
    [favorites]
  );

  const addFavorite = useCallback(
    async (favorite: Omit<Favorite, "key">) => {
      const key = favoriteKey(favorite.provider, favorite.stationId);
      if (favorites.some((f) => f.key === key)) return;
      await persist([...favorites, { ...favorite, key }]);
    },
    [favorites, persist]
  );

  const removeFavorite = useCallback(
    async (provider: Favorite["provider"], stationId: string) => {
      const key = favoriteKey(provider, stationId);
      await persist(favorites.filter((f) => f.key !== key));
    },
    [favorites, persist]
  );

  const toggleFavorite = useCallback(
    async (favorite: Omit<Favorite, "key">) => {
      if (isFavorite(favorite.provider, favorite.stationId)) {
        await removeFavorite(favorite.provider, favorite.stationId);
      } else {
        await addFavorite(favorite);
      }
    },
    [addFavorite, isFavorite, removeFavorite]
  );

  return { favorites, loaded, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
