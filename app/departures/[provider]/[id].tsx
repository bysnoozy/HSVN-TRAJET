import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { Provider, TransportMode } from "../../../src/api/types";
import DepartureRow from "../../../src/components/DepartureRow";
import DirectionFilter from "../../../src/components/DirectionFilter";
import EmptyState from "../../../src/components/EmptyState";
import { colors } from "../../../src/constants/theme";
import { useApiKeys } from "../../../src/hooks/useApiKeys";
import { useDepartures } from "../../../src/hooks/useDepartures";
import { useFavorites } from "../../../src/hooks/useFavorites";
import { useTrajet } from "../../../src/hooks/useTrajet";

function guessMode(provider: Provider): TransportMode {
  return provider === "sncf" ? "train" : "metro";
}

export default function DepartureBoardScreen() {
  const params = useLocalSearchParams<{ provider: Provider; id: string; name?: string }>();
  const provider = params.provider;
  const stationId = decodeURIComponent(params.id ?? "");
  const stationName = params.name ? decodeURIComponent(params.name) : stationId;

  const { keys, loaded } = useApiKeys();
  const { departures, loading, error, refresh } = useDepartures(provider, stationId, keys);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addStep } = useTrajet();
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  const favorite = loaded ? isFavorite(provider, stationId) : false;

  // Un même arrêt dessert en général plusieurs sens (ex: RER A vers La Défense
  // OU vers Boissy-Saint-Léger) : on les détecte à partir des destinations
  // réellement présentes dans les passages, pour permettre de filtrer sur un
  // sens précis ("aller") puis sur l'autre ("retour").
  const directions = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const d of departures) {
      if (!seen.has(d.destination)) {
        seen.add(d.destination);
        ordered.push(d.destination);
      }
    }
    return ordered;
  }, [departures]);

  const visibleDepartures = useMemo(
    () => (selectedDirection ? departures.filter((d) => d.destination === selectedDirection) : departures),
    [departures, selectedDirection]
  );

  useEffect(() => {
    setSelectedDirection(null);
    setAddedFeedback(null);
  }, [stationId]);

  const onAddToTrajet = async (leg: "aller" | "retour") => {
    if (!selectedDirection) return;
    await addStep(leg, {
      provider,
      stationId,
      stationName,
      direction: selectedDirection,
      mode: guessMode(provider),
    });
    setAddedFeedback(leg === "aller" ? "Ajouté à l'Aller." : "Ajouté au Retour.");
    setTimeout(() => setAddedFeedback(null), 2500);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: stationName,
          headerRight: () => (
            <Pressable
              onPress={() =>
                toggleFavorite({ provider, stationId, name: stationName, city: undefined, mode: guessMode(provider) })
              }
              accessibilityRole="button"
              accessibilityLabel={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              hitSlop={8}
            >
              <Ionicons name={favorite ? "star" : "star-outline"} size={22} color="#fbbf24" />
            </Pressable>
          ),
        }}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <DirectionFilter directions={directions} selected={selectedDirection} onSelect={setSelectedDirection} />

      {selectedDirection ? (
        <View style={styles.addToTrajetRow}>
          <Text style={styles.addToTrajetLabel}>Ajouter "Vers {selectedDirection}" à Mon trajet :</Text>
          <View style={styles.addToTrajetButtons}>
            <Pressable style={styles.addToTrajetButton} onPress={() => onAddToTrajet("aller")}>
              <Text style={styles.addToTrajetButtonText}>+ Aller</Text>
            </Pressable>
            <Pressable style={styles.addToTrajetButton} onPress={() => onAddToTrajet("retour")}>
              <Text style={styles.addToTrajetButtonText}>+ Retour</Text>
            </Pressable>
          </View>
          {addedFeedback ? <Text style={styles.addedFeedback}>{addedFeedback}</Text> : null}
        </View>
      ) : null}

      {loading && departures.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : (
        <FlatList
          style={styles.list}
          data={visibleDepartures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DepartureRow departure={item} />}
          refreshing={loading}
          onRefresh={refresh}
          ListEmptyComponent={<EmptyState message="Aucun passage prévu pour le moment." />}
        />
      )}
      <Text style={styles.refreshHint}>Actualisation automatique toutes les 30 secondes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  errorBanner: { backgroundColor: "#fee2e2", borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: "#b91c1c", fontSize: 13 },
  loader: { marginTop: 32 },
  list: { flex: 1 },
  refreshHint: { textAlign: "center", color: colors.textSecondary, fontSize: 11, marginTop: 8 },
  addToTrajetRow: { backgroundColor: colors.surface, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  addToTrajetLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  addToTrajetButtons: { flexDirection: "row", gap: 8 },
  addToTrajetButton: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  addToTrajetButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  addedFeedback: { color: "#16a34a", fontSize: 12, marginTop: 8, fontWeight: "600" },
});
