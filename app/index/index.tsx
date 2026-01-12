// app/index/index.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated';
import AddToPlaylistModal from '../../components/AddToPlaylistModal';
import LikeButton from '../../components/LikeButton';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

type SongWithDuration = MediaLibrary.Asset & {
  realDuration?: number;
};

export default function MusicPlayerScreen() {
  const [songs, setSongs] = useState<SongWithDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'name' | 'duration'>('name');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const { play, currentSong } = useAudioPlayer();
  const [addToPlaylistVisible, setAddToPlaylistVisible] = useState(false);
  const [songToAdd, setSongToAdd] = useState<SongWithDuration | null>(null);

  const handleLongPress = (song: SongWithDuration) => {
    setSongToAdd(song);
    setAddToPlaylistVisible(true);
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500,
    });

    const result: SongWithDuration[] = [];
    for (const asset of media.assets) {
      const info = await MediaLibrary.getAssetInfoAsync(asset);
      result.push({
        ...asset,
        realDuration: info.duration ? info.duration * 1000 : undefined,
      });
    }

    setSongs(result);
    setLoading(false);
  };

  const formatDuration = (millis?: number) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    return `${Math.floor(totalSeconds / 60)}:${String(
      totalSeconds % 60
    ).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Scanning device audio...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Permission required to access audio files.</Text>
      </View>
    );
  }

  const filtered = songs.filter(song =>
    song.filename.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) =>
    sortType === 'name'
      ? a.filename.localeCompare(b.filename)
      : (b.realDuration ?? 0) - (a.realDuration ?? 0)
  );

  return (
    <View className="flex-1 p-5 bg-white">
      <View className="flex-row mb-2.5 gap-2">
        <TextInput
          placeholder="Search songs..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 border border-[#ccc] p-2.5 rounded-lg"
        />
        <TouchableOpacity
          onPress={() => setSortModalVisible(!sortModalVisible)}
          className="justify-center items-center px-4 border border-[#ccc] rounded-lg bg-gray-50"
        >
          <FontAwesome
            name="sort"
            size={20}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border-b border-[#eee] py-2">
            <TouchableOpacity
              className="flex-1 px-2.5"
              onPress={() => play(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <Text numberOfLines={1} className="text-base">
                {item.filename}
              </Text>
              <Text className="text-xs text-[#666]">
                {formatDuration(item.realDuration)}
              </Text>
            </TouchableOpacity>

            <LikeButton song={item} />
          </View>
        )}
      />
      {sortModalVisible && (
        <Animated.View
          layout={Layout.springify()}
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.springify()}
          className="absolute left-2.5 right-2.5 h-[54px] bg-gray-200 rounded-3xl flex-row items-center justify-around shadow-lg elevation-[12] z-50"
          style={{ bottom: currentSong ? 150 : 80 }}
        >
          <Text className="font-bold ml-4">Sort by:</Text>
          <View className="flex-row gap-4 mr-4">
            <TouchableOpacity
              onPress={() => {
                setSortType('name');
                setSortModalVisible(false);
              }}
              className={`px-3 py-1 rounded-full ${sortType === 'name' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={sortType === 'name' ? 'font-bold' : 'text-gray-600'}>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSortType('duration');
                setSortModalVisible(false);
              }}
              className={`px-3 py-1 rounded-full ${sortType === 'duration' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={sortType === 'duration' ? 'font-bold' : 'text-gray-600'}>Duration</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <AddToPlaylistModal
        visible={addToPlaylistVisible}
        onClose={() => setAddToPlaylistVisible(false)}
        song={songToAdd}
      />
    </View>
  );
}

