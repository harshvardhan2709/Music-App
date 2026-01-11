// app/index/index.tsx

import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

  const { play } = useAudioPlayer();

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
      <View className="flex-row gap-2.5 mb-2.5">
        <Button title="A–Z" onPress={() => setSortType('name')} />
        <Button title="Duration" onPress={() => setSortType('duration')} />
      </View>

      <TextInput
        placeholder="Search songs..."
        value={search}
        onChangeText={setSearch}
        className="border border-[#ccc] p-2.5 mb-2.5 rounded-lg"
      />

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border-b border-[#eee] py-2">
            <TouchableOpacity
              className="flex-1 px-2.5"
              onPress={() => play(item)}
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
    </View>
  );
}

