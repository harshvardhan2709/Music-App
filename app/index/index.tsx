// app/index/index.tsx

import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Scanning device audio...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.center}>
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
    <View style={styles.container}>
      <View style={styles.row}>
        <Button title="A–Z" onPress={() => setSortType('name')} />
        <Button title="Duration" onPress={() => setSortType('duration')} />
      </View>

      <TextInput
        placeholder="Search songs..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.songRow}>
            <TouchableOpacity
              style={styles.songTouch}
              onPress={() => play(item)}
            >
              <Text numberOfLines={1} style={styles.songTitle}>
                {item.filename}
              </Text>
              <Text style={styles.songMeta}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  songTouch: { flex: 1, paddingHorizontal: 10 },
  songTitle: { fontSize: 16 },
  songMeta: { fontSize: 12, color: '#666' },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
