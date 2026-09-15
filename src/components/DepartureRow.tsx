import { StyleSheet, Text, View } from "react-native";
import type { Departure } from "../api/types";
import { colors, modeColors, statusColors, statusLabels } from "../constants/theme";
import { formatClockTime, formatCountdown } from "../utils/time";

interface Props {
  departure: Departure;
}

export default function DepartureRow({ departure }: Props) {
  const cancelled = departure.status === "cancelled";
  return (
    <View style={[styles.container, cancelled && styles.cancelledContainer]}>
      <View style={[styles.lineBadge, { backgroundColor: modeColors[departure.mode] }]}>
        <Text style={styles.lineBadgeText} numberOfLines={1}>
          {departure.line}
        </Text>
      </View>
      <View style={styles.middle}>
        <Text style={[styles.destination, cancelled && styles.strike]} numberOfLines={1}>
          {departure.destination}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[departure.status] }]} />
          <Text style={[styles.statusText, { color: statusColors[departure.status] }]}>
            {statusLabels[departure.status]}
            {departure.status === "delayed" ? ` (+${departure.delayMinutes} min)` : ""}
          </Text>
          {departure.platform ? <Text style={styles.platform}>Voie {departure.platform}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.countdown, cancelled && styles.strike]}>{cancelled ? "--" : formatCountdown(departure.expectedTime)}</Text>
        <Text style={styles.clockTime}>{formatClockTime(departure.expectedTime)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelledContainer: { opacity: 0.6 },
  lineBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, minWidth: 64, alignItems: "center" },
  lineBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  middle: { flex: 1, marginLeft: 12, marginRight: 8 },
  destination: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  strike: { textDecorationLine: "line-through" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4, flexWrap: "wrap" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "600" },
  platform: { fontSize: 12, color: colors.textSecondary, marginLeft: 10 },
  right: { alignItems: "flex-end" },
  countdown: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  clockTime: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
