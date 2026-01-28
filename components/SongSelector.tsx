import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Song {
    id: string;
    filename: string;
    uri: string;
    duration: number;
}

interface SongSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (song: Song) => void;
}

export default function SongSelector({
    visible,
    onClose,
    onSelect,
}: SongSelectorProps) {
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadSongs();
        }
    }, [visible]);

    useEffect(() => {
        // Filter songs based on search query
        if (searchQuery.trim() === "") {
            setFilteredSongs(songs);
        } else {
            const filtered = songs.filter((song) =>
                song.filename.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setFilteredSongs(filtered);
        }
    }, [searchQuery, songs]);

    const loadSongs = async () => {
        try {
            setLoading(true);

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Required", "Please grant media library access");
                return;
            }

            const media = await MediaLibrary.getAssetsAsync({
                mediaType: "audio",
                first: 100,
            });

            const songList: Song[] = media.assets.map((asset) => ({
                id: asset.id,
                filename: asset.filename,
                uri: asset.uri,
                duration: asset.duration,
            }));

            setSongs(songList);
            setFilteredSongs(songList);
        } catch (error) {
            console.error("Error loading songs:", error);
            Alert.alert("Error", "Failed to load songs");
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSelect = (song: Song) => {
        onSelect(song);
        onClose();
        setSearchQuery("");
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50">
                <View className="flex-1 mt-20 bg-primary rounded-t-3xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-white/10">
                        <Text className="text-xl font-bold text-white">Select Song</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome name="close" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="p-4">
                        <View className="flex-row items-center bg-white/10 rounded-full px-4 py-3">
                            <FontAwesome name="search" size={16} color="#999" />
                            <TextInput
                                className="flex-1 ml-2 text-white"
                                placeholder="Search songs..."
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery !== "" && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <FontAwesome name="times-circle" size={16} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Song List */}
                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-gray-500">Loading songs...</Text>
                        </View>
                    ) : filteredSongs.length === 0 ? (
                        <View className="flex-1 items-center justify-center">
                            <FontAwesome name="music" size={48} color="#999" />
                            <Text className="text-gray-500 mt-4">
                                {searchQuery ? "No songs found" : "No songs in library"}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredSongs}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item)}
                                    className="flex-row items-center p-4 border-b border-white/10"
                                >
                                    <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center mr-3">
                                        <FontAwesome name="music" size={20} color="#ffffff" />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className="text-base font-semibold text-white"
                                            numberOfLines={1}
                                        >
                                            {item.filename.replace(/\.[^/.]+$/, "")}
                                        </Text>
                                        <Text className="text-sm text-white/60">
                                            {formatDuration(item.duration)}
                                        </Text>
                                    </View>
                                    <FontAwesome name="chevron-right" size={16} color="#999" />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
