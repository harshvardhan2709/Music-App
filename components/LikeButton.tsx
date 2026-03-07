// components/LikeButton.tsx

import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useLikes } from "../hooks/useLikes";

type Props = {
    song: any;
};

export default function LikeButton({ song }: Props) {
    const { isLiked, toggleLike } = useLikes();
    const liked = isLiked(song.id);

    const onPress = () => {
        console.log(
            "[LikeButton] pressed for",
            song.id,
            song.filename,
            "liked?",
            liked,
        );
        toggleLike(song);
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <FontAwesome
                name={liked ? "heart" : "heart-o"}
                size={18}
                color={liked ? "#ff4444" : "rgba(255, 255, 255, 0.25)"}
            />
        </TouchableOpacity>
    );
}
