import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FileTransferProgress from "../../components/FileTransferProgress";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import QRScanner from "../../components/QRScanner";
import SongSelector from "../../components/SongSelector";
import { useShare } from "../../context/ShareContext";
import { saveReceivedFile } from "../../utils/fileUtils";

type TabMode = "send" | "receive";

export default function ShareScreen() {
    const {
        mode,
        serverInfo,
        isServerRunning,
        startServer,
        stopServer,
        shareFile,
        isConnected,
        connectToPeer,
        disconnectFromPeer,
        transferProgress,
        transferError,
        fileMetadata,
        receivedFileUri,
        reset,
    } = useShare();

    const [tabMode, setTabMode] = useState<TabMode>("send");
    const [showScanner, setShowScanner] = useState(false);
    const [showSongSelector, setShowSongSelector] = useState(false);
    const [selectedSong, setSelectedSong] = useState<any>(null);

    // Handle start server
    const handleStartServer = async () => {
        try {
            await startServer();
        } catch (error) {
            Alert.alert("Error", "Failed to start server");
        }
    };

    // Handle stop server
    const handleStopServer = () => {
        stopServer();
        setSelectedSong(null);
    };

    // Handle song selection
    const handleSongSelect = async (song: any) => {
        setSelectedSong(song);
        setShowSongSelector(false);

        if (isConnected) {
            // If already connected, start sharing immediately
            try {
                await shareFile(song.uri);
            } catch (error) {
                Alert.alert("Error", "Failed to share file");
            }
        }
    };

    // Handle QR scan
    const handleQRScan = (ip: string, port: number) => {
        setShowScanner(false);
        connectToPeer(ip, port);
    };

    // Handle save received file
    const handleSaveFile = async () => {
        if (!receivedFileUri) return;

        try {
            const fileName = fileMetadata?.name || `song_${Date.now()}.mp3`;
            const savedUri = await saveReceivedFile(receivedFileUri, fileName);

            if (savedUri) {
                Alert.alert("Success!", "Song saved to your music library", [
                    {
                        text: "OK",
                        onPress: () => {
                            reset();
                        },
                    },
                ]);
            } else {
                Alert.alert("Error", "Failed to save file to music library");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to save file");
        }
    };

    // Render Send Mode
    const renderSendMode = () => {
        if (!isServerRunning) {
            return (
                <View className="flex-1 items-center justify-center p-6">
                    <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6 ">
                        <FontAwesome name="share-alt" size={40} color="#74167dff" />
                    </View>
                    <Text className="text-2xl font-bold text-black dark:text-white mb-2">
                        Share Music
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
                        Start a server to share your music with nearby devices
                    </Text>
                    <TouchableOpacity
                        onPress={handleStartServer}
                        className="bg-primary px-8 py-4 rounded-full"
                    >
                        <Text className="text-white font-bold text-lg">Start Server</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={true}
            >
                {/* Server Info */}
                {serverInfo && (
                    <View className="mb-6">
                        <QRCodeDisplay serverInfo={serverInfo} />
                    </View>
                )}

                {/* Connection Status */}
                <View className="bg-primary p-4 rounded-2xl mb-6">
                    <View className="flex-row items-center">
                        <View
                            className={`w-3 h-3 rounded-full mr-3 ${isConnected ? "bg-green-500" : "bg-gray-400"
                                }`}
                        />
                        <Text className="text-white font-semibold">
                            {isConnected ? "Device Connected" : "Waiting for connection..."}
                        </Text>
                    </View>
                </View>

                {/* Song Selection */}
                {!selectedSong ? (
                    <TouchableOpacity
                        onPress={() => setShowSongSelector(true)}
                        className="bg-primary px-6 py-4 rounded-full flex-row items-center justify-center mb-6"
                    >
                        <FontAwesome name="music" size={20} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">
                            Select Song to Share
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                                Selected Song:
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedSong(null)}>
                                <FontAwesome name="times-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-lg font-bold text-black dark:text-white">
                            {selectedSong.filename.replace(/\.[^/.]+$/, "")}
                        </Text>
                    </View>
                )}

                {/* Transfer Progress */}
                {transferProgress && transferProgress.percentage > 0 && (
                    <View className="mb-6">
                        <FileTransferProgress
                            progress={transferProgress}
                            fileName={selectedSong?.filename}
                        />
                    </View>
                )}

                {/* Error Message */}
                {transferError && (
                    <View className="bg-red-500/20 p-4 rounded-2xl mb-6">
                        <Text className="text-red-600 dark:text-red-400 text-center">
                            {transferError}
                        </Text>
                    </View>
                )}

                {/* Stop Server Button */}
                <TouchableOpacity
                    onPress={handleStopServer}
                    className="bg-red-950 px-6 py-4 rounded-full"
                >
                    <Text className="text-white font-bold text-lg text-center">
                        Stop Server
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    // Render Receive Mode
    const renderReceiveMode = () => {
        if (receivedFileUri) {
            return (
                <View className="flex-1 items-center justify-center p-6">
                    <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-6">
                        <FontAwesome name="check-circle" size={40} color="#22c55e" />
                    </View>
                    <Text className="text-2xl font-bold text-black dark:text-white mb-2">
                        Download Complete!
                    </Text>
                    {fileMetadata && (
                        <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
                            {fileMetadata.name}
                        </Text>
                    )}
                    <TouchableOpacity
                        onPress={handleSaveFile}
                        className="bg-green-500 px-8 py-4 rounded-full mb-4"
                    >
                        <Text className="text-white font-bold text-lg">
                            Save to Library
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={reset}
                        className="bg-gray-200 dark:bg-gray-800 px-8 py-4 rounded-full"
                    >
                        <Text className="text-black dark:text-white font-semibold">
                            Receive Another
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!isConnected) {
            return (
                <View className="flex-1 items-center justify-center p-6">
                    <View className="w-24 h-24 bg-purple-500/20 rounded-full items-center justify-center mb-6">
                        <FontAwesome name="qrcode" size={40} color="#530a5dff" />
                    </View>
                    <Text className="text-2xl font-bold text-black dark:text-white mb-2">
                        Receive Music
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
                        Scan the QR code shown on the sender's device
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowScanner(true)}
                        className="bg-purple-500/20 px-8 py-4 rounded-full"
                    >
                        <Text className="text-white font-bold text-lg">Scan QR Code</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View className="flex-1 items-center justify-center p-6">
                {/* Transfer Progress */}
                {transferProgress && (
                    <View className="w-full mb-6">
                        <FileTransferProgress
                            progress={transferProgress}
                            fileName={fileMetadata?.name}
                        />
                    </View>
                )}

                {/* Connection Status */}
                <View className="bg-green-500/20 p-4 rounded-2xl mb-6">
                    <View className="flex-row items-center justify-center">
                        <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                        <Text className="text-green-700 dark:text-green-400 font-semibold">
                            Connected - Receiving file...
                        </Text>
                    </View>
                </View>

                {/* Error Message */}
                {transferError && (
                    <View className="bg-red-500/20 p-4 rounded-2xl mb-6">
                        <Text className="text-red-600 dark:text-red-400 text-center">
                            {transferError}
                        </Text>
                    </View>
                )}

                {/* Cancel Button */}
                <TouchableOpacity
                    onPress={() => {
                        disconnectFromPeer();
                        reset();
                    }}
                    className="bg-red-500 px-8 py-4 rounded-full"
                >
                    <Text className="text-white font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-black">
            {/* Header */}
            <View className="bg-white dark:bg-black pt-12 pb-4 px-6 border-b border-gray-200 dark:border-gray-800">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome name="arrow-left" size={24} color="#999" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-black dark:text-white">
                        Share Music
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Tab Switcher */}
                <View className="flex-row bg-gray-100 dark:bg-gray-900 rounded-full p-1">
                    <TouchableOpacity
                        onPress={() => {
                            setTabMode("send");
                            reset();
                        }}
                        className={`flex-1 py-3 rounded-full ${tabMode === "send" ? "bg-primary" : "bg-transparent"
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${tabMode === "send"
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                                }`}
                        >
                            Send
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setTabMode("receive");
                            reset();
                        }}
                        className={`flex-1 py-3 rounded-full ${tabMode === "receive" ? "bg-purple-500/20" : "bg-transparent"
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${tabMode === "receive"
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                                }`}
                        >
                            Receive
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {tabMode === "send" ? renderSendMode() : renderReceiveMode()}

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScan={handleQRScan}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {/* Song Selector Modal */}
            <SongSelector
                visible={showSongSelector}
                onClose={() => setShowSongSelector(false)}
                onSelect={handleSongSelect}
            />
        </View>
    );
}
