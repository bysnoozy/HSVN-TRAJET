import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { TrajetLeg } from "../../src/api/types";
import EmptyState from "../../src/components/EmptyState";
import TrajetStepRow from "../../src/components/TrajetStepRow";
import { colors } from "../../src/constants/theme";
import { useApiKeys } from "../../src/hooks/useApiKeys";
import { useTrajet } from "../../src/hooks/useTrajet";

export default function TrajetScreen() {
  const router = useRouter();
  const { keys } = useApiKeys();
  const { trajet, loaded, removeStep, moveStep, reload } = useTrajet();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Enchaînement d'étapes précises (arrêt + sens) pour suivre ton trajet complet d'un coup d'œil, à l'aller
        comme au retour.
      </Text>
      <Section title="Aller" leg="aller" loaded={loaded} steps={trajet.aller} keysProp={keys} removeStep={removeStep} moveStep={moveStep} router={router} />
      <Section title="Retour" leg="retour" loaded={loaded} steps={trajet.retour} keysProp={keys} removeStep={removeStep} moveStep={moveStep} router={router} />
    </ScrollView>
  );
}

function Section({
  title,
  leg,
  loaded,
  steps,
  keysProp,
  removeStep,
  moveStep,
  router,
}: {
  title: string;
  leg: TrajetLeg;
  loaded: boolean;
  steps: ReturnType<typeof useTrajet>["trajet"]["aller"];
  keysProp: ReturnType<typeof useApiKeys>["keys"];
  removeStep: ReturnType<typeof useTrajet>["removeStep"];
  moveStep: ReturnType<typeof useTrajet>["moveStep"];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push(`/trajet/add?leg=${leg}`)}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Étape</Text>
        </Pressable>
      </View>
      {!loaded ? null : steps.length === 0 ? (
        <EmptyState message={`Aucune étape ${title.toLowerCase()} pour l'instant.`} />
      ) : (
        steps.map((step, index) => (
          <TrajetStepRow
            key={step.id}
            step={step}
            keys={keysProp}
            onMoveUp={index > 0 ? () => moveStep(leg, index, -1) : undefined}
            onMoveDown={index < steps.length - 1 ? () => moveStep(leg, index, 1) : undefined}
            onRemove={() => removeStep(leg, step.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48 },
  intro: { fontSize: 13, color: colors.textSecondary, marginBottom: 20, lineHeight: 18 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  addButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
