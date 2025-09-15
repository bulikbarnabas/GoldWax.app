import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { ClientsProvider } from "@/hooks/use-clients";
import { InventoryProvider } from "@/hooks/use-inventory";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Vissza" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ presentation: "modal" }} />
      <Stack.Screen name="receipt" options={{ presentation: "modal" }} />
      <Stack.Screen name="admin" options={{ presentation: "modal", title: "Admin Panel" }} />
      <Stack.Screen name="reports" options={{ title: "Jelentések" }} />
      <Stack.Screen name="settings" options={{ title: "Beállítások" }} />
      <Stack.Screen name="clients" options={{ title: "Ügyfelek" }} />
      <Stack.Screen name="inventory" options={{ title: "Készlet" }} />
      <Stack.Screen name="service-management" options={{ title: "Szolgáltatás kezelés" }} />
      <Stack.Screen name="barcode-scanner" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="reset-storage" options={{ presentation: "modal", title: "Adatok törlése" }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error hiding splash screen:', error);
      }
    };
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(hideSplash, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <ClientsProvider>
          <InventoryProvider>
            <CartProvider>
              <RootLayoutNav />
            </CartProvider>
          </InventoryProvider>
        </ClientsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});