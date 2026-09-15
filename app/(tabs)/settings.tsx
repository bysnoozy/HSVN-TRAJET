import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../src/constants/theme";
import { useApiKeys } from "../../src/hooks/useApiKeys";

export default function SettingsScreen() {
  const { keys, loaded, saveKeys } = useApiKeys();
  const [sncfInput, setSncfInput] = useState("");
  const [idfmInput, setIdfmInput] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) {
      setSncfInput(keys.sncf ?? "");
      setIdfmInput(keys.idfm ?? "");
    }
  }, [loaded, keys]);

  const onSave = async () => {
    await saveKeys({ sncf: sncfInput.trim(), idfm: idfmInput.trim() });
    setSavedMessage("Clés enregistrées sur cet appareil.");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Clé API SNCF</Text>
      <Text style={styles.helpText}>
        Obtenez une clé gratuite sur{" "}
        <Text style={styles.link} onPress={() => Linking.openURL("https://numerique.sncf.com/startup/api/")}>
          numerique.sncf.com/startup/api
        </Text>{" "}
        pour les horaires trains (TGV, Intercités, TER, Transilien).
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Clé API SNCF"
        placeholderTextColor={colors.textSecondary}
        value={sncfInput}
        onChangeText={setSncfInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <Text style={styles.sectionTitle}>Clé API IDFM (PRIM)</Text>
      <Text style={styles.helpText}>
        Obtenez une clé gratuite sur{" "}
        <Text style={styles.link} onPress={() => Linking.openURL("https://prim.iledefrance-mobilites.fr/")}>
          prim.iledefrance-mobilites.fr
        </Text>{" "}
        pour les horaires métro, RER, bus et tram en Île-de-France.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Clé API IDFM"
        placeholderTextColor={colors.textSecondary}
        value={idfmInput}
        onChangeText={setIdfmInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <Pressable style={styles.saveButton} onPress={onSave} accessibilityRole="button">
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </Pressable>
      {savedMessage ? <Text style={styles.savedMessage}>{savedMessage}</Text> : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Sans clé configurée, l'app fonctionne en mode démo avec des horaires factices pour quelques gares/stations
          d'exemple. Les clés sont stockées uniquement sur cet appareil (Keychain/Keystore natif, ou stockage local
          sur le web) et ne sont jamais envoyées ailleurs qu'aux API SNCF / IDFM elles-mêmes.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: 20, marginBottom: 6 },
  helpText: { fontSize: 13, color: colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  link: { color: colors.accent, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  savedMessage: { color: "#16a34a", textAlign: "center", marginTop: 10, fontSize: 13 },
  infoBox: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginTop: 28, borderWidth: 1, borderColor: colors.border },
  infoText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
});
