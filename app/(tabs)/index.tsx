import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { searchStations } from "../../src/api/search";
import type { StationResult } from "../../src/api/types";
import EmptyState from "../../src/components/EmptyState";
import StationListItem from "../../src/components/StationListItem";
import { colors } from "../../src/constants/theme";
import { useApiKeys } from "../../src/hooks/useApiKeys";

const SEARCH_DEBOUNCE_MS = 350;

export default function SearchScreen() {
  const router = useRouter();
  const { keys, loaded } = useApiKeys();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDemoMode = useMemo(() => loaded && !keys.sncf && !keys.idfm, [loaded, keys]);

  const runSearch = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const stations = await searchStations(text, keys);
        setResults(stations);
      } finally {
        setLoading(false);
      }
    },
    [keys]
  );

  const onChangeQuery = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(text), SEARCH_DEBOUNCE_MS);
    },
    [runSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {isDemoMode ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Mode démo (aucune clé API configurée) — allez dans Réglages pour ajouter vos clés SNCF / IDFM et obtenir
            les vrais horaires temps réel.
          </Text>
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Chercher une gare, une station..."
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={onChangeQuery}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {loading ? <ActivityIndicator style={styles.loader} color={colors.accent} /> : null}
      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(item) => `${item.provider}:${item.id}`}
        renderItem={({ item }) => (
          <StationListItem
            station={item}
            onPress={() => router.push(`/departures/${item.provider}/${encodeURIComponent(item.id)}?name=${encodeURIComponent(item.name)}`)}
          />
        )}
        ListEmptyComponent={!loading && query.length > 0 ? <EmptyState message="Aucun résultat" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  banner: { backgroundColor: colors.warningBg, padding: 10, borderRadius: 8, marginBottom: 12 },
  bannerText: { color: colors.warningText, fontSize: 13 },
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
});
