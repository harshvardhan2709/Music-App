import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type PlayerContextType = {
    play: (song: any) => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
    currentSong: any | null;
};

const AudioPlayerContext = createContext<PlayerContextType>({
    play: () => { },
    togglePlayPause: () => { },
    isPlaying: false,
    currentSong: null,
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<any | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);

    // Configure Audio Mode on Mount
    useEffect(() => {
        async function configureAudio() {
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                });
            } catch (e) {
                console.log('Error configuring audio mode', e);
            }
        }
        configureAudio();

        // Cleanup on unmount
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Handle song changes
    useEffect(() => {
        async function loadAndPlaySound() {
            if (!currentSong) return;

            try {
                // Unload previous sound
                if (soundRef.current) {
                    await soundRef.current.unloadAsync();
                }

                // Create new sound
                const { sound } = await Audio.Sound.createAsync(
                    { uri: currentSong.uri.split('?')[0] },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );

                soundRef.current = sound;
            } catch (error) {
                console.log('Error loading sound', error);
            }
        }

        loadAndPlaySound();
    }, [currentSong?.id]);

    // Playback status update callback
    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
        }
    };

    // Play new song
    const play = React.useCallback((song: any) => {
        if (currentSong?.id === song.id) {
            // Same song, just resume
            soundRef.current?.playAsync();
        } else {
            // New song
            setCurrentSong(song);
        }
    }, [currentSong?.id]);

    // Toggle play/pause
    const togglePlayPause = React.useCallback(async () => {
        if (!soundRef.current) return;

        try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
                if (status.isPlaying) {
                    await soundRef.current.pauseAsync();
                } else {
                    await soundRef.current.playAsync();
                }
            }
        } catch (error) {
            console.log('Error toggling playback', error);
        }
    }, []);

    const contextValue = React.useMemo(() => ({
        play,
        togglePlayPause,
        isPlaying,
        currentSong,
    }), [play, togglePlayPause, isPlaying, currentSong]);

    return (
        <AudioPlayerContext.Provider value={contextValue}>
            {children}
        </AudioPlayerContext.Provider>
    );
}

export const useAudioPlayerContext = () => useContext(AudioPlayerContext);
export const useAudioPlayer = useAudioPlayerContext;
