import { Tabs } from "expo-router";
import { Home, Scissors, Calendar, User } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF1493',
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F0F0F0',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Kezdőlap",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Szolgáltatások",
          tabBarIcon: ({ color }) => <Scissors color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Előzmények",
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}