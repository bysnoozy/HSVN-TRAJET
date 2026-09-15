const { fetchDepartures } = require("./transitClients");

const NOTIFIED_TTL_MS = 3 * 60 * 60 * 1000; // 3h : au-delà, un passage est de toute façon passé

/**
 * Une passe de vérification : pour chaque appareil enregistré, pour chaque
 * étape de son trajet (aller + retour), récupère les prochains passages dans
 * le sens attendu et déclenche une notification pour toute perturbation
 * (retard >= seuil, ou suppression) pas encore notifiée.
 */
async function runTick({ store, expoPush, keys, thresholdMin, log = console }) {
  const devices = store.loadDevices();
  const messages = [];
  const deviceCount = Object.keys(devices).length;

  for (const device of Object.values(devices)) {
    const legs = /** @type {const} */ (["aller", "retour"]);
    for (const leg of legs) {
      for (const step of device.trajet?.[leg] ?? []) {
        try {
          const departures = await fetchDepartures(step, keys);
          const disrupted = departures
            .filter((d) => d.destination === step.direction)
            .filter((d) => d.status === "cancelled" || d.delayMinutes >= thresholdMin)
            .slice(0, 3);

          for (const d of disrupted) {
            const key = `${leg}:${step.id}:${d.scheduledTime}`;
            if (device.notified[key]) continue;
            device.notified[key] = Date.now();
            const cancelled = d.status === "cancelled";
            messages.push({
              to: device.expoPushToken,
              sound: "default",
              title: cancelled ? `🚫 ${step.stationName} : passage supprimé` : `⏱️ ${step.stationName} : retard`,
              body: `${d.line} vers ${d.destination} — ${cancelled ? "supprimé" : `+${d.delayMinutes} min`}`,
              data: { leg, stepId: step.id, provider: step.provider },
            });
          }
        } catch (err) {
          log.error(`[tick] étape ${step.provider}:${step.stationId} (${leg}) : ${err.message}`);
        }
      }
    }

    const cutoff = Date.now() - NOTIFIED_TTL_MS;
    for (const [k, ts] of Object.entries(device.notified)) {
      if (ts < cutoff) delete device.notified[k];
    }
  }

  store.saveDevices(devices);

  let sent = 0;
  if (messages.length > 0) {
    sent = await expoPush.sendPushNotifications(messages);
  }

  return { devices: deviceCount, disruptionsFound: messages.length, notificationsSent: sent };
}

module.exports = { runTick };
