import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

export default function FeaturesScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <View className="flex-1 bg-surface pt-12">
            {/* Header */}
            <View className="px-5 mb-6">
                <View
                    style={{
                        backgroundColor: "rgba(25, 4, 25, 0.85)",
                        borderWidth: 1,
                        borderColor: "rgba(127, 25, 230, 0.25)",
                        borderRadius: 24,
                        padding: 16,
                    }}
                >
                    <Text className="text-xl font-bold text-center text-neon-purple">
                        Features
                    </Text>
                </View>
            </View>

            <View className="flex-1 px-5">
                {/* Share Music Card */}
                <TouchableOpacity
                    onPress={() => router.push("/share")}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        padding: 20,
                        borderRadius: 20,
                        backgroundColor: "rgba(25, 4, 25, 0.85)",
                        borderWidth: 1,
                        borderColor: "rgba(127, 25, 230, 0.25)",
                        marginBottom: 12,
                    }}
                >
                    <View
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: "rgba(127, 25, 230, 0.2)",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <FontAwesome name="share-alt" size={22} color="#c084fc" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{ fontWeight: "700", fontSize: 16, color: "#ffffff" }}
                        >
                            Share Music
                        </Text>
                        <Text
                            style={{
                                color: "rgba(255, 255, 255, 0.4)",
                                fontSize: 13,
                                marginTop: 2,
                            }}
                        >
                            Send & receive songs via Wi-Fi
                        </Text>
                    </View>
                    <FontAwesome
                        name="chevron-right"
                        size={14}
                        color="rgba(255, 255, 255, 0.3)"
                    />
                </TouchableOpacity>

                {/* Coming Soon Section */}
                <View
                    style={{
                        alignItems: "center",
                        marginTop: 40,
                        opacity: 0.5,
                    }}
                >
                    <FontAwesome
                        name="rocket"
                        size={32}
                        color="rgba(127, 25, 230, 0.4)"
                    />
                    <Text
                        style={{
                            color: "rgba(255, 255, 255, 0.35)",
                            fontSize: 16,
                            fontWeight: "600",
                            marginTop: 12,
                        }}
                    >
                        More Features Coming Soon
                    </Text>
                    <Text
                        style={{
                            color: "rgba(255, 255, 255, 0.2)",
                            fontSize: 13,
                            marginTop: 4,
                        }}
                    >
                        Stay tuned for updates
                    </Text>
                </View>
            </View>
        </View>
    );
}
