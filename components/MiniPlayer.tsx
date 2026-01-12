import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function MiniPlayer() {
    const { currentSong, isPlaying, togglePlayPause } = useAudioPlayer();

    if (!currentSong) return null;

    return (
        <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify()}
            className="absolute bottom-[75px] left-[10px] right-[10px]"
        >
            <View className="bg-gray-200 rounded-3xl px-3 py-2.5 flex-row items-center shadow-sm elevation-2">
                {/* 🎵 Artwork Placeholder */}
                <View className="w-[42px] h-[42px] rounded-lg bg-[#e5e5e5] justify-center items-center">
                    <FontAwesome
                        name="music"
                        size={20}
                        color="#000"
                    />
                </View>

                {/* 📄 Song Info */}
                <View className="flex-1 mx-3">
                    <Text numberOfLines={1} className="text-sm font-semibold text-black">
                        {currentSong.filename}
                    </Text>
                    <Text className="text-[11px] text-[#666] mt-0.5">
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
        </Animated.View>
    );
}

