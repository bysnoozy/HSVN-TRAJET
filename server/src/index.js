require("dotenv/config");
const express = require("express");
const store = require("./store");
const expoPush = require("./expoPush");
const { runTick } = require("./tick");

const app = express();
app.use(express.json({ limit: "256kb" }));

const PORT = Number(process.env.PORT ?? 3000);
const THRESHOLD_MIN = Number(process.env.DISRUPTION_DELAY_THRESHOLD_MIN ?? 5);
const TICK_SECRET = process.env.TICK_SECRET ?? "";
const KEYS = { sncf: process.env.SNCF_API_KEY || undefined, idfm: process.env.IDFM_API_KEY || undefined };

app.get("/health", (_req, res) => {
  res.json({ ok: true, devices: Object.keys(store.loadDevices()).length });
});

// Enregistre (ou met à jour) un appareil : son token de push Expo et la
// liste d'étapes (aller/retour) de son trajet, à surveiller côté serveur.
app.post("/register", (req, res) => {
  const { expoPushToken, trajet } = req.body ?? {};
  if (typeof expoPushToken !== "string" || !expoPushToken.startsWith("ExponentPushToken")) {
    return res.status(400).json({ error: "expoPushToken invalide" });
  }
  if (!trajet || typeof trajet !== "object" || !Array.isArray(trajet.aller) || !Array.isArray(trajet.retour)) {
    return res.status(400).json({ error: "trajet invalide (attendu: { aller: [], retour: [] })" });
  }
  const device = store.upsertDevice(expoPushToken, trajet);
  res.json({ ok: true, steps: device.trajet.aller.length + device.trajet.retour.length });
});

app.delete("/register", (req, res) => {
  const { expoPushToken } = req.body ?? {};
  if (typeof expoPushToken === "string") store.removeDevice(expoPushToken);
  res.json({ ok: true });
});

// Une passe de vérification. Prévu pour être appelé par un cron externe
// (ex: cron-job.org, GitHub Actions scheduled workflow) toutes les
// 2-5 minutes ; voir server/README.md.
app.post("/tick", async (req, res) => {
  if (TICK_SECRET && req.header("x-tick-secret") !== TICK_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const result = await runTick({ store, expoPush, keys: KEYS, thresholdMin: THRESHOLD_MIN });
    res.json(result);
  } catch (err) {
    console.error("[/tick] erreur:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`HSVN Trajet notification server listening on :${PORT}`);
  if (!KEYS.sncf && !KEYS.idfm) {
    console.warn("Aucune clé SNCF/IDFM configurée (SNCF_API_KEY / IDFM_API_KEY) : /tick ne détectera rien.");
  }
});

const autoTickMinutes = Number(process.env.AUTO_TICK_MINUTES ?? 0);
if (autoTickMinutes > 0) {
  console.log(`Auto-tick interne activé : toutes les ${autoTickMinutes} min.`);
  setInterval(() => {
    runTick({ store, expoPush, keys: KEYS, thresholdMin: THRESHOLD_MIN }).catch((err) =>
      console.error("[auto-tick] erreur:", err)
    );
  }, autoTickMinutes * 60_000);
}
