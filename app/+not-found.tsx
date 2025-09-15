import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { useEffect } from "react";
import { Home } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to home on web after a short delay
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: "Oldal nem található" }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.errorCode}>404</Text>
        </View>
        <Text style={styles.title}>Az oldal nem található</Text>
        <Text style={styles.subtitle}>A keresett oldal nem létezik vagy áthelyezésre került.</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Home size={20} color="white" />
          <Text style={styles.buttonText}>Vissza a főoldalra</Text>
        </TouchableOpacity>
        
        {Platform.OS === 'web' && (
          <Text style={styles.redirectText}>Automatikus átirányítás...</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: "bold" as const,
    color: Colors.gold.main,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: "center",
    maxWidth: 300,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "white",
  },
  redirectText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
  },
});
