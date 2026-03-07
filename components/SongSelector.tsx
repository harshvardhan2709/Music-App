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
                Alert.alert(
                    "Permission Required",
                    "Please grant media library access",
                );
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
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
                <View
                    style={{
                        flex: 1,
                        marginTop: 80,
                        backgroundColor: "#0a0a0a",
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        borderWidth: 1,
                        borderColor: "rgba(127, 25, 230, 0.25)",
                        borderBottomWidth: 0,
                    }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: "rgba(127, 25, 230, 0.15)",
                        }}
                    >
                        <Text
                            style={{ fontSize: 20, fontWeight: "700", color: "#c084fc" }}
                        >
                            Select Song
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome
                                name="close"
                                size={22}
                                color="rgba(255, 255, 255, 0.5)"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={{ padding: 16 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderWidth: 1,
                                borderColor: "rgba(127, 25, 230, 0.15)",
                            }}
                        >
                            <FontAwesome
                                name="search"
                                size={14}
                                color="rgba(192, 132, 252, 0.5)"
                            />
                            <TextInput
                                style={{
                                    flex: 1,
                                    marginLeft: 10,
                                    color: "#ffffff",
                                    fontSize: 14,
                                }}
                                placeholder="Search songs..."
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery !== "" && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <FontAwesome
                                        name="times-circle"
                                        size={16}
                                        color="rgba(255, 255, 255, 0.3)"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Song List */}
                    {loading ? (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "rgba(255, 255, 255, 0.4)" }}>
                                Loading songs...
                            </Text>
                        </View>
                    ) : filteredSongs.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FontAwesome
                                name="music"
                                size={40}
                                color="rgba(127, 25, 230, 0.3)"
                            />
                            <Text
                                style={{
                                    color: "rgba(255, 255, 255, 0.4)",
                                    marginTop: 16,
                                }}
                            >
                                {searchQuery ? "No songs found" : "No songs in library"}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredSongs}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "rgba(255, 255, 255, 0.03)",
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 10,
                                            backgroundColor: "rgba(127, 25, 230, 0.1)",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 12,
                                        }}
                                    >
                                        <FontAwesome name="music" size={18} color="#7f19e6" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                fontWeight: "600",
                                                color: "#ffffff",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {item.filename.replace(/\.[^/.]+$/, "")}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: "rgba(255, 255, 255, 0.4)",
                                                marginTop: 2,
                                            }}
                                        >
                                            {formatDuration(item.duration)}
                                        </Text>
                                    </View>
                                    <FontAwesome
                                        name="chevron-right"
                                        size={12}
                                        color="rgba(255, 255, 255, 0.2)"
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
