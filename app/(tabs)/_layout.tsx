import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#2563eb",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoris",
          tabBarIcon: ({ color, size }) => <Ionicons name="star" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Réglages",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
