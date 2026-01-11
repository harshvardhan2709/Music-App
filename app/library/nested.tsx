// app/library/nested.tsx

import { Link } from "expo-router";
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function LibraryNestedScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl text-black font-bold text-center mt-5">Nested</Text>
      <Link href="/library/nested" push asChild>
        <Button title="nested" />
      </Link>
    </View>
  );
}

