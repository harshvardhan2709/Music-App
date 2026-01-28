import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlaylists } from "../../context/PlaylistsContext";

export default function LibraryScreen() {
  const { playlists, createPlaylist } = usePlaylists();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setIsModalVisible(false);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black p-5 pt-12">
      <View className="bg-primary p-4 rounded-3xl mb-4 ">
        <Text className="text-xl font-bold text-center text-white">
          My Library
        </Text>
      </View>

      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="bg-primary px-8 py-3 rounded-full flex-1 flex-row items-center justify-center gap-2"
        >
          <FontAwesome name="plus" size={16} className="color-white" />
          <Text className="text-white font-semibold">New Playlist</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", gap: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <TouchableOpacity
            className="w-full bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-4 flex-row items-center gap-4"
            onPress={() => router.push("/favorites")}
          >
            <View className="bg-red-100 dark:bg-red-800/30 w-12 h-12 rounded-full justify-center items-center">
              <FontAwesome name="heart" size={24} color="#ff4444" />
            </View>
            <View>
              <Text className="font-bold text-lg text-black dark:text-white">
                Favorites
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                Your liked songs
              </Text>
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
            className="w-[48%] bg-primary rounded-2xl p-4 aspect-square justify-between mb-4"
            onPress={() => router.push(`/library/${item.id}` as any)}
          >
            <View className="bg-white/20 w-12 h-12 rounded-full justify-center items-center">
              <FontAwesome name="music" size={24} color="#ffffff" />
            </View>
            <View>
              <Text className="font-bold text-lg text-white" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                songs: {item.songs.length}
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
          behavior={Platform.OS === "android" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-center items-center px-10"
        >
          <View className="bg-white dark:bg-gray-900 w-full rounded-2xl p-6">
            <Text className="text-xl font-bold mb-4 text-black dark:text-white">
              Playlist Name{" "}
            </Text>
            <TextInput
              placeholder="Playlist Name"
              placeholderTextColor="#999"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              className="border-b border-gray-300 dark:border-gray-700 p-2 text-lg mb-2 text-black dark:text-white"
            />
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-gray-500 dark:text-gray-400 font-semibold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}>
                <Text className="text-primary font-bold text-lg">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
