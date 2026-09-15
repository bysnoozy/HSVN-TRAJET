import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors } from "../../src/constants/theme";
import { useApiKeys } from "../../src/hooks/useApiKeys";
import { useNotifications } from "../../src/hooks/useNotifications";
import { useTrajet } from "../../src/hooks/useTrajet";

export default function SettingsScreen() {
  const { keys, loaded, saveKeys } = useApiKeys();
  const { trajet } = useTrajet();
  const notifications = useNotifications();
  const [sncfInput, setSncfInput] = useState("");
  const [idfmInput, setIdfmInput] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [backendUrlInput, setBackendUrlInput] = useState("");

  useEffect(() => {
    if (loaded) {
      setSncfInput(keys.sncf ?? "");
      setIdfmInput(keys.idfm ?? "");
    }
  }, [loaded, keys]);

  useEffect(() => {
    if (notifications.loaded) setBackendUrlInput(notifications.backendUrl);
  }, [notifications.loaded, notifications.backendUrl]);

  const onSave = async () => {
    await saveKeys({ sncf: sncfInput.trim(), idfm: idfmInput.trim() });
    setSavedMessage("Clés enregistrées sur cet appareil.");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const onToggleNotifications = async (value: boolean) => {
    if (value) {
      await notifications.setBackendUrl(backendUrlInput.trim());
      await notifications.enable(trajet);
    } else {
      await notifications.disable();
    }
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

      <Text style={[styles.sectionTitle, styles.notifSectionTitle]}>Notifications de perturbation</Text>
      <Text style={styles.helpText}>
        Reçois une notification push (même app fermée) dès qu'un passage de "Mon trajet" est retardé ou supprimé.
        Nécessite un petit serveur à héberger toi-même — voir <Text style={styles.link} onPress={() => Linking.openURL("https://github.com/bysnoozy/HSVN-TRAJET/tree/main/server")}>server/README.md</Text>{" "}
        pour le déployer, puis colle son URL publique ci-dessous.
      </Text>
      {Platform.OS === "web" ? (
        <Text style={styles.helpText}>Les notifications push ne sont pas disponibles sur le web : utilise l'app iOS/Android.</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="https://mon-serveur.exemple.com"
            placeholderTextColor={colors.textSecondary}
            value={backendUrlInput}
            onChangeText={setBackendUrlInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!notifications.enabled}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Activer les notifications</Text>
            <Switch
              value={notifications.enabled}
              onValueChange={onToggleNotifications}
              disabled={notifications.status.kind === "loading"}
            />
          </View>
          {notifications.status.kind === "loading" ? (
            <Text style={styles.helpText}>Activation en cours…</Text>
          ) : null}
          {notifications.status.kind === "error" ? (
            <Text style={styles.errorMessage}>{notifications.status.message}</Text>
          ) : null}
          {notifications.status.kind === "success" ? (
            <Text style={styles.savedMessage}>{notifications.status.message}</Text>
          ) : null}
        </>
      )}
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
  notifSectionTitle: { marginTop: 32 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: "600" },
  errorMessage: { color: "#dc2626", fontSize: 12, marginTop: 8 },
});
