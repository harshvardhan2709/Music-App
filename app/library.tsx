
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// navigation to favorites removed

export default function LibraryScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.Text}>Library</Text>
    </View>
  );
}

const styles = StyleSheet.create ({
  Text: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});
