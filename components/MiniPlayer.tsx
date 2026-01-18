import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useAudioPlayer } from '../context/AudioPlayerContext';

import { useColorScheme } from 'nativewind';

export default function MiniPlayer() {
    const { currentSong, isPlaying, togglePlayPause } = useAudioPlayer();
    const { colorScheme } = useColorScheme();

    if (!currentSong) return null;

    return (
        <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify()}
            className="absolute bottom-[75px] left-[10px] right-[10px]"
        >
            <View className="bg-gray-200 dark:bg-gray-900 rounded-3xl px-3 py-2.5 flex-row items-center shadow-sm elevation-2">
                {/* 🎵 Artwork Placeholder */}
                <View className="w-[42px] h-[42px] rounded-lg bg-[#e5e5e5] dark:bg-gray-800 justify-center items-center">
                    <FontAwesome
                        name="music"
                        size={20}
                        color={colorScheme === 'dark' ? '#fff' : '#000'}
                    />
                </View>

                {/* 📄 Song Info */}
                <View className="flex-1 mx-3">
                    <Text numberOfLines={1} className="text-sm font-semibold text-black dark:text-white">
                        {currentSong.filename}
                    </Text>
                    <Text className="text-[11px] text-[#666] dark:text-gray-400 mt-0.5">
                        {isPlaying ? 'Playing' : 'Paused'}
                    </Text>
                </View>

                {/* ▶️ ⏸ Play / Pause */}
                <TouchableOpacity onPress={togglePlayPause}>
                    <FontAwesome
                        name={isPlaying ? 'pause' : 'play'}
                        size={28}
                        color={colorScheme === 'dark' ? '#fff' : '#000'}
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

