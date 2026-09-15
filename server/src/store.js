const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "devices.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}", "utf-8");
}

/** @returns {Record<string, { expoPushToken: string, trajet: { aller: any[], retour: any[] }, notified: Record<string, number>, updatedAt: number }>} */
function loadDevices() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveDevices(devices) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(devices, null, 2), "utf-8");
}

function upsertDevice(expoPushToken, trajet) {
  const devices = loadDevices();
  const existing = devices[expoPushToken];
  devices[expoPushToken] = {
    expoPushToken,
    trajet,
    notified: existing?.notified ?? {},
    updatedAt: Date.now(),
  };
  saveDevices(devices);
  return devices[expoPushToken];
}

function removeDevice(expoPushToken) {
  const devices = loadDevices();
  delete devices[expoPushToken];
  saveDevices(devices);
}

module.exports = { loadDevices, saveDevices, upsertDevice, removeDevice };
