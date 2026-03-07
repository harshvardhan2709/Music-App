import FontAwesome from "@expo/vector-icons/FontAwesome";
import Slider from "@react-native-community/slider";
import { useAudioPlayerStatus } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { useAudioPlayer as useAudioContext } from "../context/AudioPlayerContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ART_SIZE = SCREEN_WIDTH - 64;

interface FullScreenPlayerProps {
    visible: boolean;
    onClose: () => void;
}

const FullScreenPlayer = React.memo(
    ({ visible, onClose }: FullScreenPlayerProps) => {
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
                <LinearGradient
                    colors={["#191121", "#3a1050", "#191121"]}
                    locations={[0, 0.5, 1]}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 24,
                            paddingTop: 52,
                            paddingBottom: 8,
                        }}
                    >
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <FontAwesome name="chevron-down" size={22} color="rgba(255, 255, 255, 0.6)" />
                        </TouchableOpacity>
                        <View style={{ alignItems: "center" }}>
                            <Text
                                style={{
                                    fontSize: 10,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    color: "#7f19e6",
                                    fontWeight: "700",
                                }}
                            >
                                Now Playing
                            </Text>
                        </View>
                        <View style={{ width: 30 }} />
                    </View>

                    {/* Album Art */}
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 32,
                        }}
                    >
                        <View
                            style={{
                                width: ART_SIZE,
                                height: ART_SIZE,
                                borderRadius: 20,
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                borderWidth: 1,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                            }}
                        >
                            {/* Inner glow + icon */}
                            <View
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "rgba(127, 25, 230, 0.08)",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <FontAwesome name="music" size={80} color="rgba(127, 25, 230, 0.35)" />
                            </View>
                        </View>
                    </View>

                    {/* Track Info */}
                    <View style={{ paddingHorizontal: 32, marginTop: 16, alignItems: "center" }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 26,
                                fontWeight: "700",
                                color: "#ffffff",
                                textAlign: "center",
                                letterSpacing: -0.5,
                            }}
                        >
                            {currentSong.filename}
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                color: "rgba(148, 163, 184, 1)",
                                marginTop: 4,
                                fontWeight: "500",
                            }}
                        >
                            {currentSong.artist || "Unknown Artist"}
                        </Text>
                    </View>

                    {/* Controls Area */}
                    <View style={{ paddingHorizontal: 32, paddingTop: 28, paddingBottom: 40 }}>
                        {/* Progress Bar */}
                        <View style={{ marginBottom: 28 }}>
                            <Slider
                                style={{ width: "100%", height: 20 }}
                                minimumValue={0}
                                maximumValue={duration || 1}
                                value={currentPosition}
                                onSlidingComplete={(value) => seekTo(value)}
                                minimumTrackTintColor="#7f19e6"
                                maximumTrackTintColor="rgba(255, 255, 255, 0.08)"
                                thumbTintColor="#7f19e6"
                            />
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    paddingHorizontal: 4,
                                    marginTop: 4,
                                }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: "500", color: "rgba(148, 163, 184, 1)" }}>
                                    {formatTime(currentPosition)}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: "500", color: "rgba(148, 163, 184, 1)" }}>
                                    {formatTime(duration)}
                                </Text>
                            </View>
                        </View>

                        {/* Playback Buttons */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 32,
                            }}
                        >
                            {/* Shuffle */}
                            <TouchableOpacity onPress={toggleShuffle} style={{ padding: 8 }}>
                                <FontAwesome
                                    name="random"
                                    size={18}
                                    color={shuffleMode ? "#7f19e6" : "rgba(148, 163, 184, 1)"}
                                />
                            </TouchableOpacity>

                            {/* Main Controls */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 28,
                                }}
                            >
                                {/* Previous */}
                                <TouchableOpacity onPress={playPrevious} style={{ padding: 4 }}>
                                    <FontAwesome name="step-backward" size={28} color="#ffffff" />
                                </TouchableOpacity>

                                {/* Play/Pause - Large Circle */}
                                <TouchableOpacity
                                    onPress={togglePlayPause}
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 36,
                                        backgroundColor: "#7f19e6",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <FontAwesome
                                        name={isPlaying ? "pause" : "play"}
                                        size={28}
                                        color="#ffffff"
                                        style={{ marginLeft: isPlaying ? 0 : 4 }}
                                    />
                                </TouchableOpacity>

                                {/* Next */}
                                <TouchableOpacity onPress={playNext} style={{ padding: 4 }}>
                                    <FontAwesome name="step-forward" size={28} color="#ffffff" />
                                </TouchableOpacity>
                            </View>

                            {/* Repeat */}
                            <TouchableOpacity onPress={setRepeatMode} style={{ padding: 8 }}>
                                <View style={{ alignItems: "center", justifyContent: "center" }}>
                                    <FontAwesome
                                        name="repeat"
                                        size={18}
                                        color={repeatMode !== "off" ? "#7f19e6" : "rgba(148, 163, 184, 1)"}
                                    />
                                    {repeatMode === "one" && (
                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: -6,
                                                right: -6,
                                                width: 14,
                                                height: 14,
                                                borderRadius: 7,
                                                backgroundColor: "#7f19e6",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text
                                                style={{ fontSize: 8, fontWeight: "700", color: "#ffffff" }}
                                            >
                                                1
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </Modal>
        );
    },
);

FullScreenPlayer.displayName = "FullScreenPlayer";

export default FullScreenPlayer;
