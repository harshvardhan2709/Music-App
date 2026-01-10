import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MusicPlayerScreen() {
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

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
      first: 1000,
    });

    setSongs(media.assets);
    setLoading(false);
  };

  const playSong = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const cleanUri = uri.split('?')[0].split('#')[0];

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: cleanUri },
        { shouldPlay: true }
      );

      setSound(newSound);
    } catch (error) {
      console.error('Audio play error:', error);
      alert('This audio file cannot be played.');
    }
  };

  const stopSong = async () => {
    if (!sound) return;
    await sound.stopAsync();
    await sound.unloadAsync();
    setSound(null);
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
        <Text style={{ textAlign: 'center' }}>
          Permission is required to access music files.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {songs.length === 0 ? (
        <Text>No audio files found on device.</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.song}
              onPress={() => playSong(item.uri)}
            >
              <Text numberOfLines={1}>{item.filename}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {sound && (
        <TouchableOpacity style={styles.stopBtn} onPress={stopSong}>
          <Text style={{ color: '#fff' }}>STOP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  song: { padding: 10, borderBottomWidth: 1 },
  stopBtn: {
    backgroundColor: 'black',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
});
