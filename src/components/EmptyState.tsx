import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

interface Props {
  message: string;
}

export default function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 32, alignItems: "center" },
  text: { color: colors.textSecondary, fontSize: 14 },
});
