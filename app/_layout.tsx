import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import MiniPlayer from '../components/MiniPlayer';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import { LikesProvider } from '../context/LikesContext';
import '../global.css';

export default function TabsLayout() {
  return (
    <LikesProvider>
      <AudioPlayerProvider>
        <StatusBar />

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#000000ff',
            tabBarInactiveTintColor: '#666',

            tabBarStyle: {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
            },

            tabBarBackground: () => (
              <View className="absolute bottom-3 left-2.5 right-2.5">
                <View className="h-[54px] bg-gray-200  rounded-3xl py-3 shadow-lg elevation-[12] shadow-black/15" />
              </View>
            ),

            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Queue',
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name="list"
                  size={20}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="library"
            options={{
              title: 'Library',
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name="music"
                  size={20}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Favorites',
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name="heart"
                  size={20}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>

        <MiniPlayer />
      </AudioPlayerProvider>
    </LikesProvider>
  );
}

