import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MiniPlayer from "../components/MiniPlayer";
import { AudioPlayerProvider } from "../context/AudioPlayerContext";
import { LikesProvider } from "../context/LikesContext";
import { PlaylistsProvider } from "../context/PlaylistsContext";
import { ShareProvider } from "../context/ShareContext";
import "../global.css";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const iconColor = "#ffffff";
  const inactiveColor = "#999999";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ShareProvider>
        <LikesProvider>
          <PlaylistsProvider>
            <AudioPlayerProvider>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

              <Tabs
                screenOptions={{
                  tabBarActiveTintColor: iconColor,
                  tabBarInactiveTintColor: inactiveColor,

                  tabBarStyle: {
                    position: "absolute",
                    backgroundColor: "transparent",
                    borderTopWidth: 0,
                    elevation: 0,
                  },

                  tabBarBackground: () => (
                    <Animated.View
                      entering={FadeInDown.springify()}
                      style={{
                        position: "absolute",
                        bottom: -5 + insets.bottom,
                        left: 10,
                        right: 10,
                      }}
                    >
                      <View className="h-[54px] bg-primary rounded-3xl py-3 shadow-lg elevation-[12] shadow-black/15" />
                    </Animated.View>
                  ),

                  tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                  },
                }}
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    title: "Queue",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                      <FontAwesome name="list-ul" size={20} color={color} />
                    ),
                  }}
                />

                <Tabs.Screen
                  name="library"
                  options={{
                    title: "My Library",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                      <FontAwesome name="music" size={20} color={color} />
                    ),
                  }}
                />

                <Tabs.Screen
                  name="features"
                  options={{
                    title: "Features",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                      <FontAwesome name="cog" size={20} color={color} />
                    ),
                  }}
                />

                <Tabs.Screen
                  name="favorites"
                  options={{
                    href: null,
                    headerShown: false,
                  }}
                />

                <Tabs.Screen
                  name="share"
                  options={{
                    href: null,
                    headerShown: false,
                  }}
                />
              </Tabs>

              <MiniPlayer />
            </AudioPlayerProvider>
          </PlaylistsProvider>
        </LikesProvider>
      </ShareProvider>
    </GestureHandlerRootView>
  );
}
