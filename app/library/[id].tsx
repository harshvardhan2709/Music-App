import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { usePlaylists } from "../../context/PlaylistsContext";

export default function PlaylistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { playlists, renamePlaylist, deletePlaylist, removeSongFromPlaylist } =
        usePlaylists();
    const { play } = useAudioPlayer();

    const { colorScheme } = useColorScheme();

    const playlist = playlists.find((p) => p.id === id);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");

    useEffect(() => {
        if (playlist) {
            setEditedName(playlist.name);
        }
    }, [playlist]);

    if (!playlist) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black">
                <Text className="text-black dark:text-white">Playlist not found</Text>
            </View>
        );
    }

    const handleRename = async () => {
        if (editedName.trim() && editedName !== playlist.name) {
            await renamePlaylist(playlist.id, editedName);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Playlist",
            "Are you sure you want to delete this playlist?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deletePlaylist(playlist.id);
                        router.back();
                    },
                },
            ],
        );
    };

    const handleRemoveSong = (songId: string) => {
        removeSongFromPlaylist(playlist.id, songId);
    };

    return (
        <View className="flex-1 bg-white dark:bg-black p-5 pt-14">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5 bg-primary p-4 rounded-3xl">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome name="arrow-left" size={20} color="white" />
                </TouchableOpacity>

                {isEditing ? (
                    <TextInput
                        value={editedName}
                        onChangeText={setEditedName}
                        className="flex-1 mx-4 text-xl font-bold border-b border-white/30 text-white"
                        autoFocus
                        onBlur={handleRename}
                        onSubmitEditing={handleRename}
                    />
                ) : (
                    <Text
                        className="text-2xl font-bold flex-1 mx-4 text-center text-white"
                        numberOfLines={1}
                    >
                        {playlist.name}
                    </Text>
                )}

                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <FontAwesome
                            name="pencil"
                            size={20}
                            color={isEditing ? "#60a5fa" : "white"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <FontAwesome name="trash" size={20} color="#ff4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={playlist.songs}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Text className="text-gray-400">No songs in this playlist</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between border-b border-[#eee] dark:border-gray-800 py-3">
                        <TouchableOpacity className="flex-1" onPress={() => play(item, playlist.songs)}>
                            <Text
                                className="text-base font-semibold text-black dark:text-white"
                                numberOfLines={1}
                            >
                                {item.filename}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                {Math.floor(item.duration / 60)}:
                                {String(Math.floor(item.duration % 60)).padStart(2, "0")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleRemoveSong(item.id)}
                            className="p-2"
                        >
                            <FontAwesome name="minus-circle" size={20} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}
