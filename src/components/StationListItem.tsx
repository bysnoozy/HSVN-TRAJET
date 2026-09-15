import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StationResult } from "../api/types";
import { colors, modeColors } from "../constants/theme";

interface Props {
  station: StationResult;
  onPress: () => void;
}

export default function StationListItem({ station, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.modeBadge, { backgroundColor: modeColors[station.mode] }]}>
        <Text style={styles.modeBadgeText}>{station.mode.toUpperCase()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{station.name}</Text>
        {station.city ? <Text style={styles.city}>{station.city}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  modeBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginRight: 12 },
  modeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  city: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
