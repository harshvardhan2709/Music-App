import React from "react";
import { Text, View } from "react-native";
import { formatBytes } from "../utils/fileUtils";
import { TransferProgress } from "../utils/networkServer";

interface FileTransferProgressProps {
    progress: TransferProgress;
    fileName?: string;
}

export default function FileTransferProgress({
    progress,
    fileName,
}: FileTransferProgressProps) {
    const percentage = Math.min(Math.round(progress.percentage), 100);

    return (
        <View className="p-6 bg-primary rounded-3xl">
            <Text className="text-lg font-bold text-white mb-4 text-center">
                Transferring File
            </Text>

            {fileName && (
                <Text className="text-sm text-white/70 mb-4 text-center">
                    {fileName}
                </Text>
            )}

            {/* Progress Bar */}
            <View className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                <View
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </View>

            {/* Progress Info */}
            <View className="flex-row justify-between items-center">
                <Text className="text-sm text-white/70">
                    {formatBytes(progress.bytesTransferred)} /{" "}
                    {formatBytes(progress.totalBytes)}
                </Text>
                <Text className="text-sm font-bold text-white">{percentage}%</Text>
            </View>
        </View>
    );
}
