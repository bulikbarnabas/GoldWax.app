import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Vissza" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Bejelentkezés" }} />
      <Stack.Screen name="services" options={{ title: "Szolgáltatások" }} />
      <Stack.Screen name="clients" options={{ title: "Ügyfelek" }} />
      <Stack.Screen name="inventory" options={{ title: "Készlet" }} />
      <Stack.Screen name="reports" options={{ title: "Jelentések" }} />
      <Stack.Screen name="settings" options={{ title: "Beállítások" }} />
      <Stack.Screen name="cart" options={{ presentation: "modal", title: "Kosár" }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}