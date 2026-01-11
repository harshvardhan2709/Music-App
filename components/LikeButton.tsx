// components/LikeButton.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useLikes } from '../hooks/useLikes';

type Props = {
    song: any;
};

export default function LikeButton({ song }: Props) {
    const { isLiked, toggleLike } = useLikes();
    const liked = isLiked(song.id);

    const onPress = () => {
        console.log('[LikeButton] pressed for', song.id, song.filename, 'liked?', liked);
        toggleLike(song);
    };

    return (
        <TouchableOpacity onPress={onPress} className="px-2 py-1 justify-center items-center">
            <FontAwesome
                name={liked ? 'heart' : 'heart-o'}
                size={20}
                color={liked ? '#e74c3c' : '#666'}
            />
        </TouchableOpacity>
    );
}

