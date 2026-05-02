// app/index/index.tsx

import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  Layout,
} from "react-native-reanimated";
import SongImage from "../../../components/SongImage";
import AddToPlaylistModal from "../../../components/AddToPlaylistModal";
import LikeButton from "../../../components/LikeButton";
import { useAudioPlayer } from "../../../context/AudioPlayerContext";
import { preloadMetadataCache } from "../../../utils/metadataUtils";

type SongWithDuration = MediaLibrary.Asset & {
  realDuration?: number;
};

const ITEM_HEIGHT = 68; // 44px content + 12*2 padding + 6 marginBottom ≈ 68

const SongListItem = React.memo(({ item, isCurrent }: { item: SongWithDuration, isCurrent: boolean }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 6,
        borderRadius: 16,
        backgroundColor: isCurrent
          ? "rgba(127, 25, 230, 0.15)"
          : "rgba(255, 255, 255, 0.03)",
        borderWidth: isCurrent ? 1 : 0,
        borderColor: isCurrent
          ? "rgba(127, 25, 230, 0.4)"
          : "transparent",
      }}
    >
      {/* Album Art */}
      <View style={{ marginRight: 12 }}>
        <SongImage 
          uri={item.uri} 
          id={item.id} 
          isCurrent={isCurrent} 
        />
      </View>

      {/* Song Info */}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: isCurrent ? "700" : "500",
            color: isCurrent ? "#c084fc" : "#ffffff",
          }}
        >
          {item.filename}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.4)",
            marginTop: 2,
          }}
        >
           {item.duration ? `${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}` : "0:00"}
        </Text>
      </View>

      {/* Like Button */}
      <LikeButton songId={item.id} song={item} />
    </View>
  );
});

export default function MusicPlayerScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const [songs, setSongs] = useState<SongWithDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<"name" | "duration">("name");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const { play, currentSong } = useAudioPlayer();
  const [addToPlaylistVisible, setAddToPlaylistVisible] = useState(false);
  const [songToAdd, setSongToAdd] = useState<SongWithDuration | null>(null);

  const currentSongId = currentSong?.id;

  const handleLongPress = useCallback((song: SongWithDuration) => {
    setSongToAdd(song);
    setAddToPlaylistVisible(true);
  }, []);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    // Preload all cached metadata in one bulk DB query
    await preloadMetadataCache();

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500,
    });

    // Use duration directly from getAssetsAsync (already available)
    // No need to call getAssetInfoAsync for each song individually
    const result: SongWithDuration[] = media.assets.map(asset => ({
      ...asset,
      realDuration: asset.duration ? asset.duration * 1000 : undefined,
    }));

    setSongs(result);
    setLoading(false);
  };

  // Memoize filtered + sorted list to avoid recomputation on every render
  const sorted = useMemo(() => {
    const filtered = songs.filter((song) =>
      song.filename.toLowerCase().includes(search.toLowerCase()),
    );
    return [...filtered].sort((a, b) =>
      sortType === "name"
        ? a.filename.localeCompare(b.filename)
        : (b.realDuration ?? 0) - (a.realDuration ?? 0),
    );
  }, [songs, search, sortType]);

  const handlePlay = useCallback((item: SongWithDuration) => {
    play(item, sorted);
  }, [play, sorted]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItem = useCallback(({ item }: { item: SongWithDuration }) => (
    <TouchableOpacity
      onPress={() => handlePlay(item)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <SongListItem
        item={item}
        isCurrent={item.id === currentSongId}
      />
    </TouchableOpacity>
  ), [handlePlay, handleLongPress, currentSongId]);

  const keyExtractor = useCallback((item: SongWithDuration) => item.id, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <View className="w-16 h-16 rounded-full bg-accent/20 justify-center items-center mb-4">
          <ActivityIndicator size="large" color="#7f19e6" />
        </View>
        <Text className="text-white/70 mt-2 text-sm">
          Scanning device audio...
        </Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <View className="w-20 h-20 rounded-full bg-red-500/20 justify-center items-center mb-4">
          <FontAwesome name="lock" size={32} color="#ef4444" />
        </View>
        <Text className="text-white font-bold text-lg mb-2">
          Permission Required
        </Text>
        <Text className="text-white/50 text-center px-8">
          Please grant access to your audio files to use this app.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface pt-12">
      {/* Header */}
      <View className="px-5 mb-4">
        <View
          style={{
            backgroundColor: "rgba(25, 4, 25, 0.85)",
            borderWidth: 1,
            borderColor: "rgba(127, 25, 230, 0.25)",
            borderRadius: 24,
            padding: 16,
          }}
        >
          <Text className="text-xl font-bold text-center text-neon-purple">
            Home
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(25, 4, 25, 0.85)",
            borderWidth: 1,
            borderColor: "rgba(127, 25, 230, 0.2)",
            borderRadius: 24,
            padding: 12,
          }}
        >
          <FontAwesome name="search" size={14} color="rgba(192, 132, 252, 0.6)" />
          <TextInput
            placeholder="Search songs..."
            placeholderTextColor="rgba(192, 132, 252, 0.4)"
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              color: "#ffffff",
              fontSize: 14,
              paddingVertical: 2,
            }}
          />
          <TouchableOpacity
            onPress={() => setSortModalVisible(!sortModalVisible)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(127, 25, 230, 0.2)",
              borderWidth: 1,
              borderColor: "rgba(127, 25, 230, 0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesome name="sort" size={16} color="#c084fc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Song List */}
      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Sort Modal */}
      {sortModalVisible && (
        <Animated.View
          layout={Layout.springify()}
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.springify()}
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            height: 54,
            borderRadius: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            backgroundColor: "rgba(25, 4, 25, 0.95)",
            borderWidth: 1,
            borderColor: "rgba(127, 25, 230, 0.3)",

            bottom: currentSong ? 150 : 80,
            zIndex: 50,
          }}
        >
          <Text className="font-bold ml-4 text-neon-purple">Sort by:</Text>
          <View className="flex-row gap-4 mr-4">
            <TouchableOpacity
              onPress={() => {
                setSortType("name");
                setSortModalVisible(false);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  sortType === "name"
                    ? "rgba(127, 25, 230, 0.3)"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  fontWeight: sortType === "name" ? "700" : "400",
                  color:
                    sortType === "name"
                      ? "#c084fc"
                      : "rgba(255, 255, 255, 0.5)",
                }}
              >
                Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSortType("duration");
                setSortModalVisible(false);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  sortType === "duration"
                    ? "rgba(127, 25, 230, 0.3)"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  fontWeight: sortType === "duration" ? "700" : "400",
                  color:
                    sortType === "duration"
                      ? "#c084fc"
                      : "rgba(255, 255, 255, 0.5)",
                }}
              >
                Duration
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      {/* Floating Queue Button */}
      <TouchableOpacity
        onPress={() => router.push("/current-queue" as any)}
        style={{
          position: "absolute",
          right: 20,
          bottom: currentSong ? 150 : 80,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: "rgba(127, 25, 230, 0.3)",
          borderWidth: 1,
          borderColor: "rgba(127, 25, 230, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 40,
        }}
      >
        <FontAwesome name="list-ul" size={20} color="#c084fc" />
      </TouchableOpacity>

      <AddToPlaylistModal
        visible={addToPlaylistVisible}
        onClose={() => setAddToPlaylistVisible(false)}
        song={songToAdd}
      />
    </View>
  );
}
