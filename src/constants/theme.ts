import type { DepartureStatus, TransportMode } from "../api/types";

export const colors = {
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  accent: "#2563eb",
  warningBg: "#fef3c7",
  warningText: "#92400e",
};

export const modeColors: Record<TransportMode, string> = {
  train: "#7c3aed",
  rer: "#dc2626",
  metro: "#2563eb",
  tram: "#059669",
  bus: "#ea580c",
  autre: "#64748b",
};

export const statusColors: Record<DepartureStatus, string> = {
  on_time: "#16a34a",
  delayed: "#d97706",
  cancelled: "#dc2626",
  unknown: "#64748b",
};

export const statusLabels: Record<DepartureStatus, string> = {
  on_time: "À l'heure",
  delayed: "Retardé",
  cancelled: "Supprimé",
  unknown: "Horaire théorique",
};
