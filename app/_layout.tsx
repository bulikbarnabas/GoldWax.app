import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Vissza" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Bejelentkezés" }} />
      <Stack.Screen name="admin" options={{ title: "Admin" }} />
      <Stack.Screen name="barcode-scanner" options={{ title: "Vonalkód olvasó" }} />
      <Stack.Screen name="clients" options={{ title: "Ügyfelek" }} />
      <Stack.Screen name="inventory" options={{ title: "Készlet" }} />
      <Stack.Screen name="reports" options={{ title: "Jelentések" }} />
      <Stack.Screen name="settings" options={{ title: "Beállítások" }} />
      <Stack.Screen name="service-management" options={{ title: "Szolgáltatás kezelés" }} />
      <Stack.Screen name="cart" options={{ presentation: "modal", title: "Kosár" }} />
      <Stack.Screen name="receipt" options={{ presentation: "modal", title: "Számla" }} />
      <Stack.Screen name="reset-storage" options={{ title: "Tárhely törlése" }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    console.warn("No base url found, using fallback");
    return "https://qf0jttcocjvc4ponsbxo0.rork.com";
  }
  return url;
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
              },
            });
          },
        }),
      ],
    })
  );

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <RootLayoutNav />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}