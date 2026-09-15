import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import type { Trajet } from "../api/types";
import { getSecureItem, setSecureItem } from "../utils/storage";

const BACKEND_URL_KEY = "hsvn.notifications.backendUrl";
const ENABLED_KEY = "hsvn.notifications.enabled";
const PUSH_TOKEN_KEY = "hsvn.notifications.pushToken";

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId ?? undefined
  );
}

async function requestPushToken(): Promise<string> {
  if (Platform.OS === "web") {
    throw new Error("Les notifications push ne sont pas disponibles sur le web : utilise l'app iOS/Android.");
  }
  if (!Device.isDevice) {
    throw new Error("Les notifications push nécessitent un appareil physique (pas un simulateur).");
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") {
    throw new Error("Permission de notifications refusée.");
  }
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error(
      "Aucun projet EAS configuré (app.json > extra.eas.projectId). Lance `npx eas init` puis relance l'app."
    );
  }
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export function useNotifications() {
  const [backendUrl, setBackendUrlState] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "loading" | "error" | "success"; message?: string }>({
    kind: "idle",
  });

  useEffect(() => {
    (async () => {
      const [url, enabledRaw] = await Promise.all([getSecureItem(BACKEND_URL_KEY), getSecureItem(ENABLED_KEY)]);
      setBackendUrlState(url ?? "");
      setEnabled(enabledRaw === "true");
      setLoaded(true);
    })();
  }, []);

  const setBackendUrl = useCallback(async (url: string) => {
    setBackendUrlState(url);
    await setSecureItem(BACKEND_URL_KEY, url);
  }, []);

  const registerWithBackend = useCallback(
    async (url: string, token: string, trajet: Trajet) => {
      const res = await fetch(`${url.replace(/\/$/, "")}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expoPushToken: token, trajet }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Le serveur a répondu ${res.status} : ${body || "erreur inconnue"}`);
      }
    },
    []
  );

  const enable = useCallback(
    async (trajet: Trajet) => {
      if (!backendUrl.trim()) {
        setStatus({ kind: "error", message: "Renseigne d'abord l'URL de ton serveur de notifications." });
        return;
      }
      setStatus({ kind: "loading" });
      try {
        const token = await requestPushToken();
        await setSecureItem(PUSH_TOKEN_KEY, token);
        await registerWithBackend(backendUrl, token, trajet);
        await setSecureItem(ENABLED_KEY, "true");
        setEnabled(true);
        setStatus({ kind: "success", message: "Notifications activées." });
      } catch (e) {
        setStatus({ kind: "error", message: e instanceof Error ? e.message : "Erreur inconnue" });
      }
    },
    [backendUrl, registerWithBackend]
  );

  const disable = useCallback(async () => {
    const token = await getSecureItem(PUSH_TOKEN_KEY);
    await setSecureItem(ENABLED_KEY, "false");
    setEnabled(false);
    setStatus({ kind: "idle" });
    if (token && backendUrl.trim()) {
      fetch(`${backendUrl.replace(/\/$/, "")}/register`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expoPushToken: token }),
      }).catch(() => {});
    }
  }, [backendUrl]);

  // À appeler chaque fois que "Mon trajet" change, pour que le serveur
  // surveille toujours les bonnes étapes. Sans effet si désactivé.
  const syncTrajet = useCallback(
    async (trajet: Trajet) => {
      if (!enabled || !backendUrl.trim()) return;
      const token = await getSecureItem(PUSH_TOKEN_KEY);
      if (!token) return;
      try {
        await registerWithBackend(backendUrl, token, trajet);
      } catch {
        // Resynchronisation silencieuse : une erreur ici n'interrompt pas la
        // navigation de l'utilisateur, `enable()` remontera l'erreur si besoin.
      }
    },
    [enabled, backendUrl, registerWithBackend]
  );

  return { backendUrl, setBackendUrl, enabled, loaded, status, enable, disable, syncTrajet };
}
