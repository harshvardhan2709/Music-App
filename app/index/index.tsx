// app/index/index.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as MediaLibrary from 'expo-media-library';
import { useColorScheme } from 'nativewind';
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
  const { colorScheme } = useColorScheme();
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
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
        <Text className="text-black dark:text-white mt-2">Scanning device audio...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-black dark:text-white">Permission required to access audio files.</Text>
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
    <View className="flex-1 p-5 bg-white dark:bg-black pt-12">
      <View className="bg-gray-200 dark:bg-gray-900 p-4 rounded-3xl mb-4">
        <Text className="text-xl font-bold text-center text-black dark:text-white">Queue</Text>
      </View>

      <View className="flex-row mb-5 gap-2 bg-gray-200 dark:bg-gray-900 p-3 rounded-3xl items-center">
        <TextInput
          placeholder="Search songs..."
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          value={search}
          onChangeText={setSearch}
          className="flex-1 bg-white dark:bg-black border border-[#ccc] dark:border-gray-700 p-2.5 rounded-2xl text-black dark:text-white"
        />
        <TouchableOpacity
          onPress={() => setSortModalVisible(!sortModalVisible)}
          className="justify-center items-center w-10 h-10 rounded-full bg-white dark:bg-black border border-[#ccc] dark:border-gray-700"
        >
          <FontAwesome
            name="sort"
            size={18}
            color={colorScheme === 'dark' ? '#fff' : '#333'}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border-b border-[#eee] dark:border-gray-800 py-2">
            <TouchableOpacity
              className="flex-1 px-2.5"
              onPress={() => play(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <Text numberOfLines={1} className="text-base text-black dark:text-white">
                {item.filename}
              </Text>
              <Text className="text-xs text-[#666] dark:text-gray-400">
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
          className="absolute left-2.5 right-2.5 h-[54px] bg-gray-200 dark:bg-gray-800 rounded-3xl flex-row items-center justify-around shadow-lg elevation-[12] z-50"
          style={{ bottom: currentSong ? 150 : 80 }}
        >
          <Text className="font-bold ml-4 text-black dark:text-white">Sort by:</Text>
          <View className="flex-row gap-4 mr-4">
            <TouchableOpacity
              onPress={() => {
                setSortType('name');
                setSortModalVisible(false);
              }}
              className={`px-3 py-1 rounded-full ${sortType === 'name' ? 'bg-white dark:bg-black shadow-sm' : ''}`}
            >
              <Text className={sortType === 'name' ? 'font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSortType('duration');
                setSortModalVisible(false);
              }}
              className={`px-3 py-1 rounded-full ${sortType === 'duration' ? 'bg-white dark:bg-black shadow-sm' : ''}`}
            >
              <Text className={sortType === 'duration' ? 'font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}>Duration</Text>
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

