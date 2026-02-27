import FontAwesome from "@expo/vector-icons/FontAwesome";
import Slider from "@react-native-community/slider";
import { useAudioPlayerStatus } from "expo-audio";
import React from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAudioPlayer as useAudioContext } from "../context/AudioPlayerContext";
interface FullScreenPlayerProps {
    visible: boolean;
    onClose: () => void;
}

const FullScreenPlayer = React.memo(({ visible, onClose }: FullScreenPlayerProps) => {
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
        player,
    } = useAudioContext();

    const status = player ? useAudioPlayerStatus(player) : null;
    const currentPosition = status ? status.currentTime * 1000 : 0;
    const duration = status ? status.duration * 1000 : 0;
    const seekTo = (value: number) => {
        player?.seekTo(value / 1000);
    };

    if (!currentSong) return null;

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };



    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-white dark:bg-black">
                {/* Header with close button */}
                <View className="flex-row justify-between items-center px-5 pt-12 pb-4">
                    <TouchableOpacity onPress={onClose}>
                        <FontAwesome name="chevron-down" size={24} color="#341539" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-primary">Now Playing</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Album Art */}
                <View className="flex-1 justify-center items-center px-10">
                    <View className="w-72 h-72 rounded-3xl bg-primary justify-center items-center shadow-lg elevation-8">
                        <FontAwesome name="music" size={120} color="#ffffff" />
                    </View>

                    {/* Song Info */}
                    <View className="w-full mt-8">
                        <Text
                            numberOfLines={1}
                            className="text-2xl font-bold text-center text-black dark:text-white mb-2"
                        >
                            {currentSong.filename}
                        </Text>
                        <Text className="text-base text-center text-gray-500 dark:text-gray-400">
                            {formatTime(duration)}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="px-8 mb-2">
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        value={currentPosition}
                        onSlidingComplete={(value) => seekTo(value)}
                        minimumTrackTintColor="#341539"
                        maximumTrackTintColor="#cccccc"
                        thumbTintColor="#341539"
                    />
                    <View className="flex-row justify-between px-2">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(currentPosition)}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(duration)}
                        </Text>
                    </View>
                </View>

                {/* Playback Controls */}
                <View className="px-8 pb-12">
                    {/* Top row: Shuffle and Repeat */}
                    <View className="flex-row justify-around items-center mb-8">
                        <TouchableOpacity
                            onPress={toggleShuffle}
                            className={`w-12 h-12 rounded-full justify-center items-center ${shuffleMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'
                                }`}
                        >
                            <FontAwesome
                                name="random"
                                size={20}
                                color={shuffleMode ? '#ffffff' : '#666666'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={setRepeatMode}
                            className={`w-12 h-12 rounded-full justify-center items-center ${repeatMode !== 'off' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'
                                }`}
                        >
                            <View className="items-center justify-center">
                                <FontAwesome
                                    name="repeat"
                                    size={20}
                                    color={repeatMode !== 'off' ? '#ffffff' : '#666666'}
                                />
                                {repeatMode === 'one' && (
                                    <View className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white items-center justify-center">
                                        <Text className="text-[8px] font-bold text-primary">1</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Main controls: Previous, Play/Pause, Next */}
                    <View className="flex-row justify-around items-center">
                        <TouchableOpacity
                            onPress={playPrevious}
                            className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 justify-center items-center"
                        >
                            <FontAwesome name="step-backward" size={28} color="#341539" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={togglePlayPause}
                            className="w-20 h-20 rounded-full bg-primary justify-center items-center shadow-lg elevation-8"
                        >
                            <FontAwesome
                                name={isPlaying ? "pause" : "play"}
                                size={36}
                                color="#ffffff"
                                style={{ marginLeft: isPlaying ? 0 : 4 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={playNext}
                            className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 justify-center items-center"
                        >
                            <FontAwesome name="step-forward" size={28} color="#341539" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

FullScreenPlayer.displayName = 'FullScreenPlayer';

export default FullScreenPlayer;
