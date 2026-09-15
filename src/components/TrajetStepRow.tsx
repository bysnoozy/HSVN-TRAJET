import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ApiKeys, TrajetStep } from "../api/types";
import { colors, modeColors, statusColors } from "../constants/theme";
import { useDepartures } from "../hooks/useDepartures";
import { formatClockTime, formatCountdown } from "../utils/time";

interface Props {
  step: TrajetStep;
  keys: ApiKeys;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
}

export default function TrajetStepRow({ step, keys, onMoveUp, onMoveDown, onRemove }: Props) {
  const router = useRouter();
  const { departures, loading } = useDepartures(step.provider, step.stationId, keys);
  const nextPassages = departures.filter((d) => d.destination === step.direction).slice(0, 2);

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push(
          `/departures/${step.provider}/${encodeURIComponent(step.stationId)}?name=${encodeURIComponent(step.stationName)}`
        )
      }
      accessibilityRole="button"
    >
      <View style={[styles.modeBadge, { backgroundColor: modeColors[step.mode] }]}>
        <Text style={styles.modeBadgeText}>{step.mode.toUpperCase()}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.station}>{step.stationName}</Text>
        <Text style={styles.direction}>Vers {step.direction}</Text>
        {nextPassages.length > 0 ? (
          <View style={styles.passagesRow}>
            {nextPassages.map((p) => (
              <View key={p.id} style={styles.passageChip}>
                <View style={[styles.dot, { backgroundColor: statusColors[p.status] }]} />
                <Text style={styles.passageText}>
                  {formatCountdown(p.expectedTime)} ({formatClockTime(p.expectedTime)})
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noPassage}>{loading ? "Chargement..." : "Aucun passage à venir"}</Text>
        )}
      </View>
      <View style={styles.actions}>
        {onMoveUp ? (
          <Pressable onPress={onMoveUp} hitSlop={6} accessibilityLabel="Monter cette étape">
            <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        {onMoveDown ? (
          <Pressable onPress={onMoveDown} hitSlop={6} accessibilityLabel="Descendre cette étape">
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        <Pressable onPress={onRemove} hitSlop={6} accessibilityLabel="Retirer cette étape">
          <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginRight: 12, marginTop: 2 },
  modeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  middle: { flex: 1 },
  station: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  direction: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  passagesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  passageChip: { flexDirection: "row", alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  passageText: { fontSize: 12, color: colors.textPrimary, fontWeight: "600" },
  noPassage: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  actions: { alignItems: "center", gap: 6, marginLeft: 8 },
});
