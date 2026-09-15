/**
 * Portage côté serveur (Node, CommonJS) des mêmes clients API que l'app
 * (src/api/sncf.ts et src/api/idfm.ts) : ne récupère que ce qu'il faut pour
 * détecter une perturbation sur un arrêt donné, dans un sens donné. Voir ces
 * fichiers pour le détail des API SNCF (Navitia) et IDFM (SIRI Lite).
 */

const SNCF_BASE_URL = "https://api.sncf.com/v1/coverage/sncf";
const IDFM_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace";

function parseNavitiaDate(value) {
  if (!value || value.length < 15) return undefined;
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(
    11,
    13
  )}:${value.slice(13, 15)}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function getSncfDepartures(stopAreaId, apiKey) {
  const auth = Buffer.from(`${apiKey}:`, "utf-8").toString("base64");
  const res = await fetch(`${SNCF_BASE_URL}/stop_areas/${encodeURIComponent(stopAreaId)}/departures?count=20`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`SNCF API error (${res.status})`);
  const data = await res.json();
  const departures = data.departures ?? [];
  return departures.map((d) => {
    const sdt = d.stop_date_time ?? {};
    const scheduled = parseNavitiaDate(sdt.base_departure_date_time ?? sdt.departure_date_time);
    const expected = parseNavitiaDate(sdt.departure_date_time ?? sdt.base_departure_date_time);
    const delayMinutes = scheduled && expected ? Math.round((expected.getTime() - scheduled.getTime()) / 60_000) : 0;
    const info = d.display_informations ?? {};
    const isRealtime = sdt.data_freshness === "realtime";
    return {
      line: info.headsign ? `${info.commercial_mode ?? ""} ${info.headsign}`.trim() : (info.commercial_mode ?? "Train"),
      destination: info.direction ?? "Destination inconnue",
      scheduledTime: (scheduled ?? new Date()).toISOString(),
      delayMinutes,
      status: !isRealtime ? "unknown" : delayMinutes > 1 ? "delayed" : "on_time",
    };
  });
}

async function getIdfmDepartures(stopPointRef, apiKey) {
  const res = await fetch(`${IDFM_BASE_URL}/stop-monitoring?MonitoringRef=${encodeURIComponent(stopPointRef)}`, {
    headers: { apikey: apiKey, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`IDFM API error (${res.status})`);
  const data = await res.json();
  const visits = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit ?? [];
  return visits.map((v) => {
    const mvj = v.MonitoredVehicleJourney ?? {};
    const call = mvj.MonitoredCall ?? {};
    const scheduled = call.AimedDepartureTime ?? call.AimedArrivalTime;
    const expected = call.ExpectedDepartureTime ?? call.ExpectedArrivalTime ?? scheduled;
    const scheduledDate = scheduled ? new Date(scheduled) : new Date();
    const expectedDate = expected ? new Date(expected) : scheduledDate;
    const delayMinutes = Math.round((expectedDate.getTime() - scheduledDate.getTime()) / 60_000);
    const cancelled = call.DepartureStatus === "cancelled" || call.ArrivalStatus === "cancelled";
    return {
      line: mvj.PublishedLineName?.[0]?.value ?? mvj.LineRef?.value ?? "Ligne",
      destination: mvj.DestinationName?.[0]?.value ?? "Destination inconnue",
      scheduledTime: scheduledDate.toISOString(),
      delayMinutes,
      status: cancelled ? "cancelled" : delayMinutes > 1 ? "delayed" : "on_time",
    };
  });
}

/**
 * @param {{ provider: 'sncf'|'idfm', stationId: string }} step
 * @param {{ sncf?: string, idfm?: string }} keys
 */
async function fetchDepartures(step, keys) {
  if (step.provider === "sncf") {
    if (!keys.sncf) return [];
    return getSncfDepartures(step.stationId, keys.sncf);
  }
  if (!keys.idfm) return [];
  return getIdfmDepartures(step.stationId, keys.idfm);
}

module.exports = { fetchDepartures };
