/**
 * Comptes X (Twitter) officiels associés à quelques lignes, pour l'actualité
 * trafic ("Actualités de la ligne"). ⚠️ Liste de démarrage établie de mémoire,
 * PAS vérifiée en direct (impossible de contacter x.com depuis cet
 * environnement de dev) : certains identifiants peuvent être faux, renommés
 * ou obsolètes. Corrige-les dans l'app (bouton crayon sur le widget
 * d'actualités) — la correction est mémorisée sur l'appareil et prime
 * toujours sur cette liste, voir useLineXHandle.
 */
export const DEFAULT_LINE_X_ACCOUNTS: Record<string, string> = {
  "RER A": "Ligne_A_RER",
  "RER B": "Ligne_B_RATP",
  "RER C": "RERC_SNCF",
  "RER D": "RERD_SNCF",
  "RER E": "RERE_SNCF",
  "TRANSILIEN P": "Transilien_P",
  "TRANSILIEN H": "Transilien_H",
  "TRANSILIEN J": "Transilien_J",
  "TRANSILIEN L": "Transilien_L",
  "TRANSILIEN N": "Transilien_N",
  "TRANSILIEN U": "Transilien_U",
  M1: "Ligne1_RATP",
  M4: "Ligne4_RATP",
  M13: "Ligne13_RATP",
};

/**
 * Normalise un nom de ligne pour la recherche dans la table. Les APIs ne
 * renvoient pas toujours un nom formaté pareil (ex: le métro peut arriver
 * comme juste "1" avec mode="metro" plutôt que "M1") : on utilise le mode
 * pour lever l'ambiguïté quand la ligne n'est qu'un numéro.
 */
export function normalizeLineName(line: string, mode?: string): string {
  const trimmed = line.trim().toUpperCase();
  if (mode === "metro" && /^\d+$/.test(trimmed)) return `M${trimmed}`;
  return trimmed
    .replace(/MÉTRO\s*/g, "M")
    .replace(/\s+/g, " ")
    .replace(/^M\s+(\d)/, "M$1");
}
