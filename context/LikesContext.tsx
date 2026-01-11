// context/LikesContext.tsx

import React, { createContext, useCallback, useMemo, useState } from 'react';

type Song = any;

type LikesContextType = {
    likesMap: Record<string, Song>;
    toggleLike: (song: Song) => void;
    isLiked: (id: string) => boolean;
    getAll: () => Song[];
};

export const LikesContext = createContext<LikesContextType>({
    likesMap: {},
    toggleLike: () => { },
    isLiked: () => false,
    getAll: () => [],
});

export function LikesProvider({ children }: { children: React.ReactNode }) {
    const [likesMap, setLikesMap] = useState<Record<string, Song>>({});

    const isLiked = useCallback(
        (id: string) => !!likesMap[id],
        [likesMap]
    );

    const toggleLike = useCallback((song: Song) => {
        if (!song || !song.id) {
            console.log('[Likes] toggleLike called with invalid song', song);
            return;
        }

        setLikesMap(prev => {
            const exists = !!prev[song.id];
            if (exists) {
                console.log('[Likes] Unliking', song.id, song.filename);
                const copy = { ...prev };
                delete copy[song.id];
                return copy;
            }

            console.log('[Likes] Liking', song.id, song.filename);
            return { ...prev, [song.id]: song };
        });
    }, []);

    const getAll = useCallback(() => Object.values(likesMap), [likesMap]);

    const value = useMemo(
        () => ({ likesMap, toggleLike, isLiked, getAll }),
        [likesMap, toggleLike, isLiked, getAll]
    );

    return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export default LikesProvider;
