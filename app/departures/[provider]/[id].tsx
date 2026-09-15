import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { Provider, TransportMode } from "../../../src/api/types";
import DepartureRow from "../../../src/components/DepartureRow";
import EmptyState from "../../../src/components/EmptyState";
import { colors } from "../../../src/constants/theme";
import { useApiKeys } from "../../../src/hooks/useApiKeys";
import { useDepartures } from "../../../src/hooks/useDepartures";
import { useFavorites } from "../../../src/hooks/useFavorites";

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

  const favorite = loaded ? isFavorite(provider, stationId) : false;

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

      {loading && departures.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : (
        <FlatList
          style={styles.list}
          data={departures}
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
});
