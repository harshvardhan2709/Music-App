// app/index/index.tsx

import { Audio } from 'expo-av';
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

/* ------------------ TYPES ------------------ */

type SongWithDuration = MediaLibrary.Asset & {
  realDuration?: number; // milliseconds
};

/* ------------------ SCREEN ------------------ */

export default function MusicPlayerScreen() {
  const [songs, setSongs] = useState<SongWithDuration[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'name' | 'duration'>('name');

  useEffect(() => {
    loadSongs();
  }, []);

  /* ------------------ HELPERS ------------------ */

  const formatDuration = (millis?: number) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  /* ------------------ LOAD SONGS (FAST) ------------------ */

  const loadSongs = async () => {
    setLoading(true);

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    // FAST: get audio list
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500, // keep reasonable
    });

    // BACKGROUND: fetch duration (ONE state update)
    setTimeout(async () => {
      const result: SongWithDuration[] = [];

      for (const asset of media.assets) {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          result.push({
            ...asset,
            realDuration: info.duration
              ? info.duration * 1000 // seconds → ms
              : undefined,
          });
        } catch {
          result.push(asset);
        }
      }

      setSongs(result);
      setLoading(false);
    }, 0);
  };

  /* ------------------ AUDIO CONTROLS ------------------ */

  const playSong = async (uri: string) => {
    try {
      if (sound) await sound.unloadAsync();

      const cleanUri = uri.split('?')[0].split('#')[0];

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: cleanUri },
        { shouldPlay: true }
      );

      setSound(newSound);
    } catch {
      alert('Cannot play this file');
    }
  };

  const stopSong = async () => {
    if (!sound) return;
    await sound.stopAsync();
    await sound.unloadAsync();
    setSound(null);
  };

  /* ------------------ UI STATES ------------------ */

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
        <Text>Permission is required to access music files.</Text>
      </View>
    );
  }

  /* ------------------ SEARCH + SORT ------------------ */

  const filteredSongs = songs.filter(song =>
    song.filename.toLowerCase().includes(search.toLowerCase())
  );

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortType === 'name') {
      return a.filename.localeCompare(b.filename);
    }
    return (b.realDuration ?? 0) - (a.realDuration ?? 0);
  });

  /* ------------------ RENDER ------------------ */

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
        data={sortedSongs}
        keyExtractor={item => item.id}
        initialNumToRender={15}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.song}
            onPress={() => playSong(item.uri)}
          >
            <Text style={styles.songTitle} numberOfLines={1}>
              {item.filename}
            </Text>
            <Text style={styles.songMeta}>
              {formatDuration(item.realDuration)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {sound && (
        <TouchableOpacity style={styles.stopBtn} onPress={stopSong}>
          <Text style={{ color: '#fff' }}>STOP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  song: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  songTitle: {
    fontSize: 16,
    color: '#000',
  },
  songMeta: {
    fontSize: 12,
    color: '#666',
  },
  stopBtn: {
    backgroundColor: 'black',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
