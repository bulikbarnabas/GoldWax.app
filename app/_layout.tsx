import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { ClientsProvider } from "@/hooks/use-clients";
import { InventoryProvider } from "@/hooks/use-inventory";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Web-specific routing fix for page refresh
    if (Platform.OS === 'web') {
      // Handle invalid routes on web
      const validRoutes = [
        '/',
        '/login',
        '/cart',
        '/receipt',
        '/admin',
        '/reports',
        '/settings',
        '/clients',
        '/inventory',
        '/service-management',
        '/barcode-scanner',
        '/services',
        '/history',
        '/profile',
        '/dashboard'
      ];
      
      // Check if current path is valid
      const isValidRoute = validRoutes.some(route => 
        pathname === route || pathname?.startsWith('/(tabs)')
      );
      
      // If not valid and not already redirecting, go to home
      if (!isValidRoute && pathname && pathname !== '/+not-found') {
        router.replace('/');
      }
    }
  }, [pathname, router]);

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
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});