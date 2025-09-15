import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Platform, View, Text } from "react-native";
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
            Hiba történt az alkalmazásban
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            Kérjük frissítse az oldalt vagy próbálja újra később.
          </Text>
          {Platform.OS === 'web' && (
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: 20,
                padding: '10px 20px',
                backgroundColor: '#D4AF37',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Oldal frissítése
            </button>
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
    
    // Web-specific initialization
    if (Platform.OS === 'web') {
      console.log('Initializing web app...');
      console.log('Current URL:', window.location.href);
      console.log('Current pathname:', window.location.pathname);
      console.log('Base path env:', process.env.EXPO_PUBLIC_BASE_PATH);
      
      // Handle GitHub Pages routing
      const currentPath = window.location.pathname;
      const isGitHubPages = window.location.hostname.includes('github.io');
      
      if (isGitHubPages) {
        console.log('Running on GitHub Pages');
        
        // Extract repository name from URL
        const pathParts = currentPath.split('/').filter(Boolean);
        const repoName = pathParts[0];
        
        if (repoName && currentPath === `/${repoName}`) {
          // Redirect to the app root with trailing slash
          console.log('Redirecting to app root with trailing slash');
          window.location.replace(`/${repoName}/`);
          return;
        }
      }
      
      // Set up error handling for navigation
      const handleError = (event: ErrorEvent) => {
        console.error('Web error:', event.error);
        if (event.error?.message?.includes('router') || event.error?.message?.includes('navigation')) {
          console.log('Navigation error detected, reloading...');
          setTimeout(() => window.location.reload(), 1000);
        }
      };
      
      window.addEventListener('error', handleError);
      
      return () => {
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <WebErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
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
        </trpc.Provider>
      </QueryClientProvider>
    </WebErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});