import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Platform, View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { ClientsProvider } from "@/hooks/use-clients";
import { InventoryProvider } from "@/hooks/use-inventory";
import { trpc, trpcClient } from "@/lib/trpc";

// Web-specific error boundary
class WebErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Web Error Boundary caught an error:', error, errorInfo);
    
    // Web-specific error handling
    if (Platform.OS === 'web') {
      // Try to recover from navigation errors
      if (error.message.includes('router') || error.message.includes('navigation')) {
        console.log('Navigation error detected, attempting recovery...');
        setTimeout(() => {
          try {
            window.location.reload();
          } catch (e) {
            console.error('Recovery failed:', e);
          }
        }, 1000);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>
            Hiba történt az alkalmazásban
          </Text>
          <Text style={errorStyles.message}>
            Kérjük frissítse az oldalt vagy próbálja újra később.
          </Text>
          {Platform.OS === 'web' && (
            <TouchableOpacity 
              style={errorStyles.button}
              onPress={() => window.location.reload()}
            >
              <Text style={errorStyles.buttonText}>Oldal frissítése</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  // Egyszerű routing konfiguráció problémás logika nélkül

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
    <WebErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
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
      </trpc.Provider>
    </WebErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold' as const,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold' as const,
  },
});