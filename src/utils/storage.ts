import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

/** Stockage "sécurisé" : Keychain/Keystore natif, ou AsyncStorage sur web (SecureStore n'existe pas sur web). */
export async function getSecureItem(key: string): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
