import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function MiniPlayer() {
    const { currentSong, isPlaying, togglePlayPause } = useAudioPlayer();

    if (!currentSong) return null;

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {/* 🎵 Artwork Placeholder */}
                <View style={styles.artwork}>
                    <FontAwesome
                        name="music"
                        size={20}
                        color="#000"
                    />
                </View>

                {/* 📄 Song Info */}
                <View style={styles.info}>
                    <Text numberOfLines={1} style={styles.title}>
                        {currentSong.filename}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isPlaying ? 'Playing' : 'Paused'}
                    </Text>
                </View>

                {/* ▶️ ⏸ Play / Pause */}
                <TouchableOpacity onPress={togglePlayPause}>
                    <FontAwesome
                        name={isPlaying ? 'pause' : 'play'}
                        size={28}
                        color="#000"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 75,
        left: 10,
        right: 10,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    artwork: {
        width: 42,
        height: 42,
        borderRadius: 8,
        backgroundColor: '#e5e5e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginHorizontal: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    subtitle: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
});
