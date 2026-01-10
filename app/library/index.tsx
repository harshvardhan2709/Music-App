

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
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl text-black font-bold text-center "></Text>
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 300,
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
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

