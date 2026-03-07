import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useMemo } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import LikeButton from "../../components/LikeButton";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useLikes } from "../../hooks/useLikes";

export default function FavoritesScreen() {
    const { likesMap } = useLikes();
    const { play, currentSong } = useAudioPlayer();

    const liked = useMemo(() => Object.values(likesMap), [likesMap]);

    const isCurrentSong = (item: any) => currentSong?.id === item.id;

    return (
        <View className="flex-1 bg-surface pt-12">
            {/* Header */}
            <View className="px-5 mb-4">
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(239, 68, 68, 0.2)",
                        borderRadius: 24,
                        padding: 16,
                    }}
                >
                    <FontAwesome
                        name="heart"
                        size={20}
                        color="#ff4444"
                        style={{ marginRight: 10 }}
                    />
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "700",
                            color: "#ffffff",
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        Favorites
                    </Text>
                    <View style={{ width: 30 }} />
                </View>
            </View>

            <FlatList
                data={liked}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <FontAwesome
                            name="heart-o"
                            size={40}
                            color="rgba(239, 68, 68, 0.3)"
                        />
                        <Text
                            style={{
                                color: "rgba(255, 255, 255, 0.4)",
                                fontSize: 16,
                                marginTop: 12,
                            }}
                        >
                            No liked songs yet
                        </Text>
                        <Text
                            style={{
                                color: "rgba(255, 255, 255, 0.25)",
                                fontSize: 13,
                                marginTop: 4,
                            }}
                        >
                            Tap the heart icon on any song
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => play(item, liked)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 12,
                                paddingHorizontal: 14,
                                marginBottom: 6,
                                borderRadius: 16,
                                backgroundColor: isCurrentSong(item)
                                    ? "rgba(127, 25, 230, 0.15)"
                                    : "rgba(255, 255, 255, 0.03)",
                                borderWidth: isCurrentSong(item) ? 1 : 0,
                                borderColor: isCurrentSong(item)
                                    ? "rgba(127, 25, 230, 0.4)"
                                    : "transparent",
                            }}
                        >
                            {/* Album Art Placeholder */}
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 12,
                                    backgroundColor: isCurrentSong(item)
                                        ? "rgba(127, 25, 230, 0.3)"
                                        : "rgba(239, 68, 68, 0.1)",
                                }}
                            >
                                <FontAwesome
                                    name={isCurrentSong(item) ? "volume-up" : "heart"}
                                    size={isCurrentSong(item) ? 16 : 18}
                                    color={isCurrentSong(item) ? "#c084fc" : "#ff4444"}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 15,
                                        fontWeight: isCurrentSong(item) ? "700" : "500",
                                        color: isCurrentSong(item) ? "#c084fc" : "#ffffff",
                                    }}
                                >
                                    {item.filename}
                                </Text>
                            </View>

                            <LikeButton song={item} />
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
