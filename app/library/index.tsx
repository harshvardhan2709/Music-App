// app/library/index.tsx

import { Link } from "expo-router";
import React from 'react';
import { Alert, Button, Modal, Text, View } from 'react-native';
import styles from './styles';

export default function LibraryScreen() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const handleOpenAlert = () => {
    Alert.alert('DELETE!!!', 'Are you sure you want to delete this song?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => console.log('Song deleted') },
    ]);
  };

  return (
    <View style={styles.container}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
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

