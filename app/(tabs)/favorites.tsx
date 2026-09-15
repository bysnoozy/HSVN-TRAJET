import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native";
import EmptyState from "../../src/components/EmptyState";
import StationListItem from "../../src/components/StationListItem";
import { colors } from "../../src/constants/theme";
import { useFavorites } from "../../src/hooks/useFavorites";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.stationItem}>
              <StationListItem
                station={{ id: item.stationId, provider: item.provider, name: item.name, city: item.city, mode: item.mode }}
                onPress={() =>
                  router.push(
                    `/departures/${item.provider}/${encodeURIComponent(item.stationId)}?name=${encodeURIComponent(item.name)}`
                  )
                }
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Retirer ${item.name} des favoris`}
              onPress={() => removeFavorite(item.provider, item.stationId)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState message="Aucun favori pour l'instant. Ajoutez une gare ou une station depuis son écran d'horaires." />
        }
        contentContainerStyle={favorites.length === 0 ? styles.emptyContent : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  row: { flexDirection: "row", alignItems: "center" },
  stationItem: { flex: 1 },
  removeButton: { padding: 10, marginLeft: 4, marginBottom: 8 },
  emptyContent: { flexGrow: 1, justifyContent: "center" },
});
