import React, { useMemo } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LikeButton from '../../components/LikeButton';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useLikes } from '../../hooks/useLikes';

export default function FavoritesScreen() {
    const { likesMap } = useLikes();
    const { play } = useAudioPlayer();

    const liked = useMemo(() => Object.values(likesMap), [likesMap]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Favorites</Text>

            <FlatList
                data={liked}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text style={styles.empty}>No liked songs yet.</Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={styles.info}
                            onPress={() => play(item)}
                        >
                            <Text numberOfLines={1} style={styles.songTitle}>
                                {item.filename}
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
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    empty: { color: '#666', textAlign: 'center', marginTop: 20 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    info: { flex: 1, paddingRight: 10 },
    songTitle: { fontSize: 16 },
});
