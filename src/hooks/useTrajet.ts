import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { Trajet, TrajetLeg, TrajetStep } from "../api/types";

const TRAJET_STORAGE_KEY = "hsvn.trajet.v1";

function makeStepId(step: Omit<TrajetStep, "id">): string {
  return `${step.provider}:${step.stationId}:${step.direction}`;
}

// Trajet d'exemple pré-rempli au premier lancement (mode démo), pour montrer
// tout de suite un vrai enchaînement d'étapes aller/retour.
const DEFAULT_ALLER: Array<Omit<TrajetStep, "id">> = [
  { provider: "sncf", stationId: "demo:esbly", stationName: "Esbly", direction: "Chelles - Gournay", mode: "train" },
  { provider: "sncf", stationId: "demo:chelles", stationName: "Chelles - Gournay", direction: "Porte Maillot", mode: "rer" },
  {
    provider: "idfm",
    stationId: "demo:porte-maillot",
    stationName: "Porte Maillot",
    direction: "Esplanade de la Défense",
    mode: "metro",
  },
];

const DEFAULT_RETOUR: Array<Omit<TrajetStep, "id">> = [
  {
    provider: "idfm",
    stationId: "demo:esplanade-defense",
    stationName: "Esplanade de la Défense",
    direction: "Porte Maillot",
    mode: "metro",
  },
  { provider: "idfm", stationId: "demo:porte-maillot", stationName: "Porte Maillot", direction: "Chelles - Gournay", mode: "rer" },
  { provider: "sncf", stationId: "demo:chelles", stationName: "Chelles - Gournay", direction: "Esbly", mode: "train" },
];

const DEFAULT_TRAJET: Trajet = {
  aller: DEFAULT_ALLER.map((s) => ({ ...s, id: makeStepId(s) })),
  retour: DEFAULT_RETOUR.map((s) => ({ ...s, id: makeStepId(s) })),
};

export function useTrajet() {
  const [trajet, setTrajet] = useState<Trajet>({ aller: [], retour: [] });
  const [loaded, setLoaded] = useState(false);

  // Chaque écran qui utilise ce hook a son propre état React, initialisé une
  // fois depuis AsyncStorage : `reload` permet de le resynchroniser (ex: au
  // focus de l'écran "Mon trajet"), pour refléter une étape ajoutée depuis un
  // autre écran (l'écran de recherche, ou le picker /trajet/add).
  const reload = useCallback(async () => {
    const raw = await AsyncStorage.getItem(TRAJET_STORAGE_KEY);
    if (raw) {
      setTrajet(JSON.parse(raw) as Trajet);
    } else {
      setTrajet(DEFAULT_TRAJET);
      await AsyncStorage.setItem(TRAJET_STORAGE_KEY, JSON.stringify(DEFAULT_TRAJET));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = useCallback(async (next: Trajet) => {
    setTrajet(next);
    await AsyncStorage.setItem(TRAJET_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addStep = useCallback(
    async (leg: TrajetLeg, step: Omit<TrajetStep, "id">) => {
      const id = makeStepId(step);
      setTrajet((prev) => {
        if (prev[leg].some((s) => s.id === id)) return prev;
        const next: Trajet = { ...prev, [leg]: [...prev[leg], { ...step, id }] };
        AsyncStorage.setItem(TRAJET_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeStep = useCallback(
    async (leg: TrajetLeg, stepId: string) => {
      setTrajet((prev) => {
        const next: Trajet = { ...prev, [leg]: prev[leg].filter((s) => s.id !== stepId) };
        AsyncStorage.setItem(TRAJET_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const moveStep = useCallback(
    async (leg: TrajetLeg, index: number, offset: -1 | 1) => {
      setTrajet((prev) => {
        const list = [...prev[leg]];
        const target = index + offset;
        if (target < 0 || target >= list.length) return prev;
        [list[index], list[target]] = [list[target], list[index]];
        const next: Trajet = { ...prev, [leg]: list };
        AsyncStorage.setItem(TRAJET_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return { trajet, loaded, addStep, removeStep, moveStep, persist, reload };
}
