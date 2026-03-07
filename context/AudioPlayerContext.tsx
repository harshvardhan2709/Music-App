import { AudioPlayer, setAudioModeAsync, useAudioPlayer as useExpoAudioPlayer } from 'expo-audio';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type RepeatMode = 'off' | 'all' | 'one';

type PlayerContextType = {
    play: (song: any, queue?: any[]) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrevious: () => void;
    setRepeatMode: () => void;
    toggleShuffle: () => void;
    removeFromQueue: (index: number) => void;
    moveInQueue: (fromIndex: number, toIndex: number) => void;
    clearUpNext: () => void;
    isPlaying: boolean;
    currentSong: any | null;
    queue: any[];
    currentIndex: number;
    repeatMode: RepeatMode;
    shuffleMode: boolean;
    player: AudioPlayer | null;
};

const AudioPlayerContext = createContext<PlayerContextType>({
    play: () => { },
    togglePlayPause: () => { },
    playNext: () => { },
    playPrevious: () => { },
    setRepeatMode: () => { },
    toggleShuffle: () => { },
    removeFromQueue: () => { },
    moveInQueue: () => { },
    clearUpNext: () => { },
    isPlaying: false,
    currentSong: null,
    queue: [],
    currentIndex: -1,
    repeatMode: 'off',
    shuffleMode: false,
    player: null,
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<any | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
    const [shuffleMode, setShuffleMode] = useState(false);
    const [originalQueue, setOriginalQueue] = useState<any[]>([]);
    const player = useExpoAudioPlayer(null);

    // Configure Audio Mode on Mount
    useEffect(() => {
        async function configureAudio() {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    interruptionMode: 'doNotMix',
                });
            } catch (e) {
                console.log('Error setting audio mode', e);
            }
        }
        configureAudio();
    }, []);

    // Handle song changes
    useEffect(() => {
        async function loadAndPlaySound() {
            if (!currentSong) return;

            try {
                player.replace({ uri: currentSong.uri.split('?')[0] });

                player.setActiveForLockScreen(true, {
                    title: currentSong.title || 'Unknown Title',
                    artist: currentSong.artist || 'Unknown Artist',
                    albumTitle: currentSong.album || 'Unknown Album',
                    artworkUrl: typeof currentSong.artwork === 'string' ? currentSong.artwork : undefined,
                });

                player.play();
            } catch (error) {
                console.log('Error loading sound', error);
            }
        }

        loadAndPlaySound();
    }, [currentSong?.id]);

    // Handle song completion based on repeat mode
    const handleSongCompletion = useCallback(() => {
        if (repeatMode === 'one') {
            player.seekTo(0);
            player.play();
        } else if (repeatMode === 'all') {
            const nextIndex = (currentIndex + 1) % queue.length;
            setCurrentIndex(nextIndex);
            setCurrentSong(queue[nextIndex]);
        } else if (repeatMode === 'off') {
            if (currentIndex < queue.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                setCurrentSong(queue[nextIndex]);
            } else {
                setIsPlaying(false);
                player.pause();
                player.clearLockScreenControls();
            }
        }
    }, [repeatMode, queue, currentIndex, player]);

    // Playback status update callback
    useEffect(() => {
        const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
            if (status.isLoaded) {
                setIsPlaying(status.playing);
                if (status.didJustFinish && !status.loop) {
                    handleSongCompletion();
                }
            }
        });

        return () => subscription.remove();
    }, [player, handleSongCompletion]);

    // Shuffle array using Fisher-Yates algorithm
    const shuffleArray = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Play new song or resume current
    const play = useCallback((song: any, newQueue?: any[]) => {
        if (newQueue && newQueue.length > 0) {
            // New queue provided
            const songIndex = newQueue.findIndex(s => s.id === song.id);
            setOriginalQueue(newQueue);
            setQueue(newQueue);
            setCurrentIndex(songIndex);
            setCurrentSong(song);
        } else if (currentSong?.id === song.id) {
            // Same song, just resume
            player.play();
        } else {
            // Different song from current queue
            const songIndex = queue.findIndex(s => s.id === song.id);
            if (songIndex !== -1) {
                setCurrentIndex(songIndex);
                setCurrentSong(song);
            } else {
                // Song not in queue, play as single
                setQueue([song]);
                setOriginalQueue([song]);
                setCurrentIndex(0);
                setCurrentSong(song);
            }
        }
    }, [currentSong?.id, queue, player]);

    // Toggle play/pause
    const togglePlayPause = useCallback(async () => {
        try {
            if (player.playing) {
                player.pause();
            } else {
                player.play();
            }
        } catch (error) {
            console.log('Error toggling playback', error);
        }
    }, [player]);

    // Play next song
    const playNext = React.useCallback(() => {
        if (queue.length === 0) return;

        let nextIndex: number;
        if (repeatMode === 'one') {
            // In repeat one mode, next goes to actual next song
            nextIndex = (currentIndex + 1) % queue.length;
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= queue.length) {
                if (repeatMode === 'all') {
                    nextIndex = 0; // Loop to beginning
                } else {
                    return; // Don't play if at end and not repeating
                }
            }
        }
        setCurrentIndex(nextIndex);
        setCurrentSong(queue[nextIndex]);
    }, [queue, currentIndex, repeatMode]);

    // Play previous song
    const playPrevious = React.useCallback(() => {
        if (queue.length === 0) return;

        // Always go to previous song (removed restart logic since we don't track position)
        let prevIndex: number;
        if (repeatMode === 'one') {
            // In repeat one mode, previous goes to actual previous song
            prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = queue.length - 1;
        } else {
            prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                if (repeatMode === 'all') {
                    prevIndex = queue.length - 1; // Loop to end
                } else {
                    return; // Don't play if at beginning and not repeating
                }
            }
        }
        setCurrentIndex(prevIndex);
        setCurrentSong(queue[prevIndex]);
    }, [queue, currentIndex, repeatMode]);

    // Cycle through repeat modes
    const setRepeatMode = React.useCallback(() => {
        setRepeatModeState(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    }, []);

    // Toggle shuffle mode
    const toggleShuffle = React.useCallback(() => {
        setShuffleMode(prev => {
            const newShuffleMode = !prev;

            if (newShuffleMode) {
                // Enable shuffle: shuffle the queue but keep current song in place
                const currentSongData = queue[currentIndex];
                const otherSongs = queue.filter((_, index) => index !== currentIndex);
                const shuffledOthers = shuffleArray(otherSongs);
                const newQueue = [currentSongData, ...shuffledOthers];
                setQueue(newQueue);
                setCurrentIndex(0); // Current song is now at index 0
            } else {
                // Disable shuffle: restore original queue
                const currentSongData = currentSong;
                setQueue(originalQueue);
                const originalIndex = originalQueue.findIndex(s => s.id === currentSongData?.id);
                setCurrentIndex(originalIndex !== -1 ? originalIndex : 0);
            }

            return newShuffleMode;
        });
    }, [queue, currentIndex, currentSong, originalQueue]);

    // Remove a song from the queue by index
    const removeFromQueue = useCallback((index: number) => {
        if (index === currentIndex) return; // Can't remove currently playing
        setQueue(prev => {
            const newQueue = [...prev];
            newQueue.splice(index, 1);
            return newQueue;
        });
        if (index < currentIndex) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    // Move a song in the queue from one index to another
    const moveInQueue = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        setQueue(prev => {
            const newQueue = [...prev];
            const [moved] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, moved);
            return newQueue;
        });
        // Adjust currentIndex if needed
        if (fromIndex === currentIndex) {
            setCurrentIndex(toIndex);
        } else {
            let newIdx = currentIndex;
            if (fromIndex < currentIndex && toIndex >= currentIndex) newIdx--;
            else if (fromIndex > currentIndex && toIndex <= currentIndex) newIdx++;
            setCurrentIndex(newIdx);
        }
    }, [currentIndex]);

    // Clear all songs after the current one
    const clearUpNext = useCallback(() => {
        setQueue(prev => prev.slice(0, currentIndex + 1));
    }, [currentIndex]);

    const contextValue = React.useMemo(() => ({
        play,
        togglePlayPause,
        playNext,
        playPrevious,
        setRepeatMode,
        toggleShuffle,
        removeFromQueue,
        moveInQueue,
        clearUpNext,
        isPlaying,
        currentSong,
        queue,
        currentIndex,
        repeatMode,
        shuffleMode,
        player,
    }), [
        play,
        togglePlayPause,
        playNext,
        playPrevious,
        setRepeatMode,
        toggleShuffle,
        removeFromQueue,
        moveInQueue,
        clearUpNext,
        isPlaying,
        currentSong,
        currentIndex,
        repeatMode,
        shuffleMode,
        queue.length,
        player,
    ]);

    return (
        <AudioPlayerContext.Provider value={contextValue}>
            {children}
        </AudioPlayerContext.Provider>
    );
}

export const useAudioPlayerContext = () => useContext(AudioPlayerContext);
export const useAudioPlayer = useAudioPlayerContext;
