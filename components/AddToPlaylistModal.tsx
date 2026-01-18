import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Song, usePlaylists } from '../context/PlaylistsContext';

type AddToPlaylistModalProps = {
    visible: boolean;
    onClose: () => void;
    song: Song | null;
};

export default function AddToPlaylistModal({
    visible,
    onClose,
    song,
}: AddToPlaylistModalProps) {
    const { playlists, addSongToPlaylist } = usePlaylists();

    const handleSelectPlaylist = async (playlistId: string) => {
        if (song) {
            await addSongToPlaylist(playlistId, song);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-end">
                    <TouchableWithoutFeedback>
                        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-5 h-1/2">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-bold text-black dark:text-white">Add to Playlist</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <FontAwesome name="times" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-500 dark:text-gray-400">
                                    Adding: <Text className="font-semibold text-black dark:text-white">{song?.filename}</Text>
                                </Text>
                            </View>

                            <FlatList
                                data={playlists}
                                keyExtractor={item => item.id}
                                ListEmptyComponent={
                                    <View className="items-center py-10">
                                        <Text className="text-gray-400">No playlists found.</Text>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="flex-row items-center py-4 border-b border-gray-100 dark:border-gray-800"
                                        onPress={() => handleSelectPlaylist(item.id)}
                                    >
                                        <View className="bg-gray-200 dark:bg-gray-800 w-12 h-12 rounded-lg justify-center items-center mr-4">
                                            <FontAwesome name="music" size={20} color="#666" />
                                        </View>
                                        <View>
                                            <Text className="font-semibold text-lg text-black dark:text-white">{item.name}</Text>
                                            <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                                {item.songs.length} songs
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
