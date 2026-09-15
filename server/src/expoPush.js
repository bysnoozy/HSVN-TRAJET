const { Expo } = require("expo-server-sdk");

const expo = new Expo();

/**
 * Envoie une liste de notifications Expo, en ignorant silencieusement les
 * tokens invalides (device désinstallé, etc.) — journalise les erreurs sans
 * jamais faire planter le tick global.
 * @returns {Promise<number>} nombre de notifications effectivement envoyées
 */
async function sendPushNotifications(messages) {
  const valid = messages.filter((m) => Expo.isExpoPushToken(m.to));
  if (valid.length === 0) return 0;

  const chunks = expo.chunkPushNotifications(valid);
  let sent = 0;
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      sent += tickets.filter((t) => t.status === "ok").length;
      for (const ticket of tickets) {
        if (ticket.status === "error") {
          console.error("[expoPush] erreur ticket:", ticket.message, ticket.details);
        }
      }
    } catch (err) {
      console.error("[expoPush] échec envoi d'un lot:", err.message);
    }
  }
  return sent;
}

module.exports = { sendPushNotifications };
