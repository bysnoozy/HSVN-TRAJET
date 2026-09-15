import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";

interface Props {
  directions: string[];
  selected: string | null;
  onSelect: (direction: string | null) => void;
  allowAll?: boolean;
}

export default function DirectionFilter({ directions, selected, onSelect, allowAll = true }: Props) {
  if (directions.length === 0) return null;
  if (allowAll && directions.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {allowAll ? <Chip label="Tous les sens" active={selected === null} onPress={() => onSelect(null)} /> : null}
      {directions.map((direction) => (
        <Chip key={direction} label={`Vers ${direction}`} active={selected === direction} onPress={() => onSelect(direction)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 0, marginBottom: 12 },
  content: { gap: 8, paddingRight: 8, alignItems: "flex-start" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: "#fff" },
});
