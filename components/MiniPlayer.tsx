import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function MiniPlayer() {
    const {
        currentSong,
        isPlaying,
        togglePlayPause,
        playNext,
        playPrevious,
        repeatMode,
        setRepeatMode,
        shuffleMode,
        toggleShuffle,
    } = useAudioPlayer();
    const [expanded, setExpanded] = useState(false);

    if (!currentSong) return null;

    return (
        <>
            {/* Mini Player Bar */}
            <Animated.View
                entering={FadeInDown.springify()}
                exiting={FadeOutDown.springify()}
                className="absolute bottom-[75px] left-[10px] right-[10px]"
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setExpanded(!expanded)}
                >
                    <View className="bg-primary rounded-3xl px-3 py-2.5 flex-row items-center shadow-sm elevation-2">
                        {/* Artwork Placeholder */}
                        <View className="w-[42px] h-[42px] rounded-lg bg-white/20 justify-center items-center">
                            <FontAwesome name="music" size={20} color="#ffffff" />
                        </View>

                        {/* Song Info */}
                        <View className="flex-1 mx-3">
                            <Text numberOfLines={1} className="text-sm font-semibold text-white">
                                {currentSong.filename}
                            </Text>
                            <Text className="text-[11px] text-white/70 mt-0.5">
                                {isPlaying ? "Playing" : "Paused"}
                            </Text>
                        </View>

                        {/* Play / Pause */}
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                        >
                            <FontAwesome
                                name={isPlaying ? "pause" : "play"}
                                size={28}
                                color="#ffffff"
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Expanded Controls Slider */}
            {expanded && (
                <Animated.View
                    entering={FadeInDown.springify()}
                    exiting={FadeOutDown.springify()}
                    className="absolute bottom-[140px] left-[10px] right-[10px] bg-primary rounded-3xl p-4 shadow-lg elevation-8"
                >
                    {/* Control Buttons Row 1: Shuffle & Repeat */}
                    <View className="flex-row justify-around items-center mb-6">
                        <TouchableOpacity
                            onPress={toggleShuffle}
                            className={`w-12 h-12 rounded-full justify-center items-center ${shuffleMode ? 'bg-white/30' : 'bg-white/10'
                                }`}
                        >
                            <FontAwesome
                                name="random"
                                size={18}
                                color={shuffleMode ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={setRepeatMode}
                            className={`w-12 h-12 rounded-full justify-center items-center ${repeatMode !== 'off' ? 'bg-white/30' : 'bg-white/10'
                                }`}
                        >
                            <View className="items-center justify-center">
                                <FontAwesome
                                    name="repeat"
                                    size={18}
                                    color={repeatMode !== 'off' ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                                />
                                {repeatMode === 'one' && (
                                    <View className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white items-center justify-center">
                                        <Text className="text-[8px] font-bold text-primary">1</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Control Buttons Row 2: Previous, Play/Pause, Next */}
                    <View className="flex-row justify-around items-center">
                        <TouchableOpacity
                            onPress={playPrevious}
                            className="w-14 h-14 rounded-full bg-white/20 justify-center items-center"
                        >
                            <FontAwesome name="step-backward" size={24} color="#ffffff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={togglePlayPause}
                            className="w-16 h-16 rounded-full bg-white justify-center items-center shadow-md"
                        >
                            <FontAwesome
                                name={isPlaying ? "pause" : "play"}
                                size={28}
                                color="#341539"
                                style={{ marginLeft: isPlaying ? 0 : 3 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={playNext}
                            className="w-14 h-14 rounded-full bg-white/20 justify-center items-center"
                        >
                            <FontAwesome name="step-forward" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </>
    );
}
