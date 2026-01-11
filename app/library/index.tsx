// app/library/index.tsx

import { Link } from "expo-router";
import React from 'react';
import { Alert, Button, Modal, Text, View } from 'react-native';

export default function LibraryScreen() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const handleOpenAlert = () => {
    Alert.alert('DELETE!!!', 'Are you sure you want to delete this song?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => console.log('Song deleted') },
    ]);
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text>Library Screen</Text>
      <Link href="/library/nested" push asChild>
        <Button title="nested" />
      </Link>
      <Button title="Delete Song" color="red" onPress={() => handleOpenAlert()} />
      <Button title="Model Open" color="green" onPress={() => setModalVisible(true)} />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-[300px] bg-white p-5 rounded-xl shadow-lg elevation-[10]">
            <Text className="text-lg font-bold mb-3">
              This is a modal!
            </Text>

            <Button
              title="Close Modal"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

    </View>

  );
}


