import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../constants/theme";
import { useLineXHandle } from "../hooks/useLineXHandle";
import LineEmbedBody from "./LineEmbedBody";

interface Props {
  line: string;
  mode?: string;
}

/** Actualités d'une ligne : timeline X embarquée (widget officiel, gratuit), repliée par défaut. */
export default function LineNewsEmbed({ line, mode }: Props) {
  const { handle, loaded, setHandle } = useLineXHandle(line, mode);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setExpanded((v) => !v)} accessibilityRole="button">
        <Ionicons name="logo-twitter" size={16} color={colors.accent} />
        <Text style={styles.headerText}>Actualités {line}{handle ? ` (@${handle})` : ""}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {!loaded ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : !handle ? (
            <Text style={styles.emptyText}>Aucun compte X associé à cette ligne pour l'instant.</Text>
          ) : (
            <>
              <LineEmbedBody handle={handle} />
              <Pressable onPress={() => Linking.openURL(`https://twitter.com/${handle}`)} style={styles.externalLink}>
                <Text style={styles.externalLinkText}>Ouvrir @{handle} sur X ↗</Text>
              </Pressable>
            </>
          )}

          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                placeholder="identifiant X (sans @)"
                placeholderTextColor={colors.textSecondary}
                value={editValue}
                onChangeText={setEditValue}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={styles.editSave}
                onPress={async () => {
                  await setHandle(editValue);
                  setEditing(false);
                }}
              >
                <Text style={styles.editSaveText}>OK</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setEditValue(handle ?? "");
                setEditing(true);
              }}
            >
              <Text style={styles.editLink}>{handle ? "Corriger ce compte" : "Renseigner le compte X de cette ligne"}</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", padding: 10, gap: 8 },
  headerText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  body: { paddingHorizontal: 10, paddingBottom: 10 },
  loader: { marginVertical: 16 },
  emptyText: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  externalLink: { marginTop: 6 },
  externalLinkText: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  editLink: { color: colors.textSecondary, fontSize: 11, marginTop: 8, textDecorationLine: "underline" },
  editRow: { flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" },
  editInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, fontSize: 13, color: colors.textPrimary },
  editSave: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  editSaveText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
