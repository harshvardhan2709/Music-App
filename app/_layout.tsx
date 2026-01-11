import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MiniPlayer from '../components/MiniPlayer';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import { LikesProvider } from '../context/LikesContext';

export default function TabsLayout() {
  return (
    <LikesProvider>
      <AudioPlayerProvider>
        <StatusBar />

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#666',

            tabBarStyle: {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
            },

            tabBarBackground: () => (
              <View style={styles.tabWrapper}>
                <View style={styles.tabBar} />
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

const styles = StyleSheet.create({
  tabWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    right: 10,
  },
  tabBar: {
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
