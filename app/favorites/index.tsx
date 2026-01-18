import React, { useMemo } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LikeButton from '../../components/LikeButton';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useLikes } from '../../hooks/useLikes';

export default function FavoritesScreen() {
    const { likesMap } = useLikes();
    const { play } = useAudioPlayer();

    const liked = useMemo(() => Object.values(likesMap), [likesMap]);

    return (
        <View className="flex-1 p-4 bg-white dark:bg-black">
            <View className="bg-gray-200 dark:bg-gray-900 p-4 rounded-3xl mb-4">
                <Text className="text-xl font-bold text-center text-black dark:text-white">Favorites</Text>
            </View>
            <FlatList
                data={liked}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text className="text-[#666] dark:text-gray-400 text-center mt-5">No liked songs yet.</Text>
                }
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between py-2 border-b border-[#eee] dark:border-gray-800">
                        <TouchableOpacity
                            className="flex-1 pr-2.5"
                            onPress={() => play(item)}
                        >
                            <Text numberOfLines={1} className="text-base text-black dark:text-white">
                                {item.filename}
                            </Text>
                        </TouchableOpacity>

                        <LikeButton song={item} />
                    </View>
                )}
            />
        </View>
    );
}

