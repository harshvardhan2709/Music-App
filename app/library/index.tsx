import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { usePlaylists } from '../../context/PlaylistsContext';

export default function LibraryScreen() {
  const { playlists, createPlaylist } = usePlaylists();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsModalVisible(false);
  };

  return (
    <View className="flex-1 bg-white p-5 pt-14">
      <View className="flex-row justify-between items-center mb-3 bottom-8">
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="bg-black px-40 py-4 rounded-full flex-row items-center gap-2"
        >
          <FontAwesome name="plus" size={16} color="white" />
          <Text className="text-white font-semibold">New Playlist</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', gap: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <TouchableOpacity
            className="w-full bg-red-50 rounded-2xl p-4 mb-4 flex-row items-center gap-4"
            onPress={() => router.push('/favorites')}
          >
            <View className="bg-red-100 w-12 h-12 rounded-full justify-center items-center">
              <FontAwesome name="heart" size={24} color="#ff4444" />
            </View>
            <View>
              <Text className="font-bold text-lg">Favorites</Text>
              <Text className="text-gray-500">Your liked songs</Text>
            </View>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400 text-lg">No playlists yet</Text>
            <Text className="text-gray-400 text-sm mt-2">
              Create one to start your collection
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="w-[48%] bg-gray-100 rounded-2xl p-4 aspect-square justify-between mb-4"
            onPress={() => router.push(`/library/${item.id}` as any)}
          >
            <View className="bg-gray-200 w-12 h-12 rounded-full justify-center items-center">
              <FontAwesome name="music" size={24} color="#666" />
            </View>
            <View>
              <Text className="font-bold text-lg" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-gray-500">
                {item.songs.length} usage
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'android' ? 'padding' : 'height'}
          className="flex-1 bg-black/50 justify-center items-center px-10"
        >
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold mb-4">Playlist Name </Text>
            <TextInput
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              className="border-b border-gray-300 p-2 text-lg mb-2"
            />
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-gray-500 font-semibold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}>
                <Text className="text-blue-500 font-bold text-lg">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
