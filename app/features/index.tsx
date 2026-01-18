import { useColorScheme } from 'nativewind';
import { Switch, Text, View } from 'react-native';

export default function FeaturesScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <View className="flex-1 bg-white dark:bg-black p-5 pt-12">
            <View className="bg-gray-200 dark:bg-gray-900 p-4 rounded-3xl mb-8">
                <Text className="text-xl font-bold text-center text-black dark:text-white">Features</Text>
            </View>

            <View className="flex-1 items-center">
                <Text className="text-xl text-gray-400 font-bold mb-8">
                    More Features Coming Soon
                </Text>
                <View className="flex-row items-center gap-2">
                    <Text className="text-base text-black dark:text-white">Dark Mode</Text>
                    <Switch
                        value={colorScheme === 'dark'}
                        onValueChange={toggleColorScheme}
                    />
                </View>
            </View>
        </View>
    );
}
