import { Audio } from 'expo-av';
import React, { createContext, useContext, useState } from 'react';

type PlayerContextType = {
    play: (song: any) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    isPlaying: boolean;
    currentSong: any | null;
};

const AudioPlayerContext = createContext<PlayerContextType>({
    play: async () => { },
    togglePlayPause: async () => { },
    isPlaying: false,
    currentSong: null,
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentSong, setCurrentSong] = useState<any | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    /* ▶️ PLAY NEW SONG */
    const play = async (song: any) => {
        try {
            setCurrentSong(song);
            setIsPlaying(true);
            if (currentSong?.id === song.id && sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded && status.isPlaying) return;

                await sound.playAsync();
                return;
            }

            if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
            }

            const cleanUri = song.uri.split('?')[0];

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: cleanUri },
                { shouldPlay: true }
            );

            setSound(newSound);

        } catch (e) {
            console.log('[AudioPlayer] play error', e);
            setIsPlaying(false);
        }
    };

    /* ⏯ PLAY / PAUSE TOGGLE */
    const togglePlayPause = async () => {
        if (!sound) return;

        if (isPlaying) {
            setIsPlaying(false);
            try {
                await sound.pauseAsync();
            } catch (e) {
                console.log('[AudioPlayer] pause error', e);
                setIsPlaying(true);
            }
        } else {
            setIsPlaying(true);
            try {
                await sound.playAsync();
            } catch (e) {
                console.log('[AudioPlayer] play error', e);
                setIsPlaying(false);
            }
        }
    };

    return (
        <AudioPlayerContext.Provider
            value={{
                play,
                togglePlayPause,
                isPlaying,
                currentSong,
            }}
        >
            {children}
        </AudioPlayerContext.Provider>
    );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);
