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
        <View className="flex-1 p-4 bg-white">
            <FlatList
                data={liked}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text className="text-[#666] text-center mt-5">No liked songs yet.</Text>
                }
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between py-2 border-b border-[#eee]">
                        <TouchableOpacity
                            className="flex-1 pr-2.5"
                            onPress={() => play(item)}
                        >
                            <Text numberOfLines={1} className="text-base">
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

