import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { searchStations } from "../../src/api/search";
import type { StationResult, TrajetLeg } from "../../src/api/types";
import DirectionFilter from "../../src/components/DirectionFilter";
import EmptyState from "../../src/components/EmptyState";
import StationListItem from "../../src/components/StationListItem";
import { colors } from "../../src/constants/theme";
import { useApiKeys } from "../../src/hooks/useApiKeys";
import { useDepartures } from "../../src/hooks/useDepartures";
import { useTrajet } from "../../src/hooks/useTrajet";

const SEARCH_DEBOUNCE_MS = 350;

export default function AddTrajetStepScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ leg: TrajetLeg }>();
  const leg = params.leg === "retour" ? "retour" : "aller";
  const { keys } = useApiKeys();
  const { addStep } = useTrajet();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [station, setStation] = useState<StationResult | null>(null);
  const [direction, setDirection] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { departures, loading } = useDepartures(station?.provider ?? "sncf", station?.id ?? "", keys);

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

  const onChangeQuery = useCallback(
    (text: string) => {
      setQuery(text);
      setStation(null);
      setDirection(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!text.trim()) {
        setResults([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          setResults(await searchStations(text, keys));
        } finally {
          setSearching(false);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [keys]
  );

  const onConfirm = async () => {
    if (!station || !direction) return;
    await addStep(leg, {
      provider: station.provider,
      stationId: station.id,
      stationName: station.name,
      direction,
      mode: station.mode,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: leg === "aller" ? "Ajouter une étape (Aller)" : "Ajouter une étape (Retour)" }} />

      {!station ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Chercher l'arrêt de cette étape..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={onChangeQuery}
            autoCorrect={false}
            autoCapitalize="none"
            autoFocus
          />
          {searching ? <ActivityIndicator style={styles.loader} color={colors.accent} /> : null}
          <FlatList
            style={styles.list}
            data={results}
            keyExtractor={(item) => `${item.provider}:${item.id}`}
            renderItem={({ item }) => <StationListItem station={item} onPress={() => setStation(item)} />}
            ListEmptyComponent={!searching && query.length > 0 ? <EmptyState message="Aucun résultat" /> : null}
          />
        </>
      ) : (
        <>
          <Pressable onPress={() => setStation(null)} style={styles.changeStation}>
            <Text style={styles.changeStationText}>← {station.name} (changer)</Text>
          </Pressable>
          <Text style={styles.sectionLabel}>Dans quel sens ?</Text>
          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.accent} />
          ) : directions.length === 0 ? (
            <EmptyState message="Aucun passage trouvé pour cet arrêt actuellement." />
          ) : (
            <DirectionFilter directions={directions} selected={direction} onSelect={setDirection} allowAll={false} />
          )}
          <Pressable
            style={[styles.confirmButton, !direction && styles.confirmButtonDisabled]}
            onPress={onConfirm}
            disabled={!direction}
          >
            <Text style={styles.confirmButtonText}>Ajouter cette étape</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  loader: { marginTop: 16 },
  list: { marginTop: 16 },
  changeStation: { marginBottom: 16 },
  changeStationText: { color: colors.accent, fontWeight: "600", fontSize: 14 },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 10 },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonDisabled: { opacity: 0.4 },
  confirmButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
