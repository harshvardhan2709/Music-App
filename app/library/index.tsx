

import { Link } from "expo-router";
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function LibraryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.Text}>Library</Text>
      <Link href="/library/nested" push asChild>
        <Button title="nested" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  Text: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});
