// app/_layout.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function TabsLayout() {
  return (
    <React.Fragment>
      <StatusBar />
      <Tabs screenOptions={{ tabBarActiveTintColor: "orange" }}>
        <Tabs.Screen name="index" options={{
          title: 'Queue', headerShown: false, popToTopOnBlur: true, tabBarIcon: () => (
            <MaterialCommunityIcons
              name="view-sequential"
              size={24}
              color="black"
            />
          ),
        }} />
        <Tabs.Screen name="library" options={{
          title: 'Library', headerShown: false, popToTopOnBlur: true, tabBarIcon: () => (
            <MaterialCommunityIcons
              name="music-box-multiple"
              size={24}
              color="black"
            />
          ),
        }} />
        <Tabs.Screen name="favorites" options={{
          title: 'Favorites', headerShown: false, popToTopOnBlur: true, tabBarIcon: () => (
            <MaterialCommunityIcons
              name="heart"
              size={24}
              color="black"
            />
          ),
        }} />

      </Tabs>
    </React.Fragment>
  );
}
