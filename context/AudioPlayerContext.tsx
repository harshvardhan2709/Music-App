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
            // Same song → just resume
            if (currentSong?.id === song.id && sound) {
                setIsPlaying(true);
                setTimeout(async () => {
                    try {
                        await sound.playAsync();
                    } catch (e) {
                        console.log('[AudioPlayer] resume error', e);
                    }
                }, 0);
                return;
            }

            // New song → unload old
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
            setCurrentSong(song);
            setIsPlaying(true);
        } catch (e) {
            console.log('[AudioPlayer] play error', e);
        }
    };

    /* ⏯ PLAY / PAUSE TOGGLE */
    const togglePlayPause = async () => {
        if (!sound) return;

        if (isPlaying) {
            setIsPlaying(false);
            setTimeout(async () => {
                try {
                    await sound.pauseAsync();
                } catch (e) {
                    console.log('[AudioPlayer] pause error', e);
                }
            }, 0);
        } else {
            setIsPlaying(true);
            setTimeout(async () => {
                try {
                    await sound.playAsync();
                } catch (e) {
                    console.log('[AudioPlayer] play error', e);
                }
            }, 0);
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
