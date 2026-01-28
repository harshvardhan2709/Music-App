import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

export default function FeaturesScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <View className="flex-1 bg-white dark:bg-black p-5 pt-12">
            <View className="bg-primary p-4 rounded-3xl mb-8">
                <Text className="text-xl font-bold text-center text-white">
                    Features
                </Text>
            </View>

            <View className="flex-1 items-center">
                <Text className="text-xl text-gray-400 font-bold mb-8">
                    More Features Coming Soon
                </Text>
                {/* <View className="flex-row justify-between items-center mb-12">
                    <Text className="text-base text-black dark:text-white">
                        Dark Mode
                    </Text>
                    <Switch
                        value={colorScheme === "dark"}
                        onValueChange={toggleColorScheme}
                    />
                </View> */}
                <View className="flex-row justify-between items-center mb-12">
                    <TouchableOpacity
                        onPress={() => router.push("/share")}
                        className="bg-primary px-8 py-3 rounded-full flex-1 flex-row items-center justify-center gap-2"
                    >
                        <FontAwesome name="share" size={16} className="color-white" />
                        <Text className="text-white font-semibold">Share Music</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
