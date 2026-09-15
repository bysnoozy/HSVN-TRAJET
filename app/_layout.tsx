import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Affiche la notification (bannière + son) même quand l'app est au premier
// plan, sinon iOS/Android la masquent silencieusement par défaut.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="departures/[provider]/[id]" options={{ title: "Prochains passages" }} />
        <Stack.Screen name="trajet/add" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
