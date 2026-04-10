import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    type GenreType,
    GENRE_LIST,
    classifyAllSongs,
    loadGenreMap,
} from '../utils/genreService';
import { type Playlist, type Song, usePlaylists } from './PlaylistsContext';

type GenreMap = Record<string, GenreType>;

type ClassificationStatus = 'idle' | 'loading_songs' | 'classifying' | 'creating_playlists' | 'done' | 'error';

type GenreContextType = {
    genreMap: GenreMap;
    status: ClassificationStatus;
    progress: number; // 0-100
    progressMessage: string;
    errorMessage: string;
    startClassification: () => Promise<void>;
    getGenre: (songId: string) => GenreType | undefined;
    getSongsByGenre: (genre: GenreType) => string[]; // returns song IDs
    genreCounts: Record<GenreType, number>;
    hasClassified: boolean;
    resetClassification: () => Promise<void>;
};

const GenreContext = createContext<GenreContextType>({
    genreMap: {},
    status: 'idle',
    progress: 0,
    progressMessage: '',
    errorMessage: '',
    startClassification: async () => { },
    getGenre: () => undefined,
    getSongsByGenre: () => [],
    genreCounts: {} as Record<GenreType, number>,
    hasClassified: false,
    resetClassification: async () => {},
});

const CLASSIFIED_FLAG_KEY = 'Msick-genre-classified';

export function GenreProvider({ children }: { children: React.ReactNode }) {
    const [genreMap, setGenreMap] = useState<GenreMap>({});
    const [status, setStatus] = useState<ClassificationStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [hasClassified, setHasClassified] = useState(false);
    const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists();

    // Load existing genre map on mount
    useEffect(() => {
        (async () => {
            const existing = await loadGenreMap();
            if (Object.keys(existing).length > 0) {
                setGenreMap(existing);
                setHasClassified(true);
            }
            const flag = await AsyncStorage.getItem(CLASSIFIED_FLAG_KEY);
            if (flag === 'true') {
                setHasClassified(true);
            }
        })();
    }, []);

    const getGenre = useCallback((songId: string): GenreType | undefined => {
        return genreMap[songId];
    }, [genreMap]);

    const getSongsByGenre = useCallback((genre: GenreType): string[] => {
        return Object.entries(genreMap)
            .filter(([_, g]) => g === genre)
            .map(([id]) => id);
    }, [genreMap]);

    const genreCounts = React.useMemo(() => {
        const counts = {} as Record<GenreType, number>;
        GENRE_LIST.forEach(g => { counts[g] = 0; });
        Object.values(genreMap).forEach(genre => {
            if (counts[genre] !== undefined) {
                counts[genre]++;
            }
        });
        return counts;
    }, [genreMap]);

    const resetClassification = useCallback(async () => {
        await AsyncStorage.removeItem('Msick-genre-map');
        await AsyncStorage.removeItem('Msick-genre-classified');
        setGenreMap({});
        setHasClassified(false);
        setStatus('idle');
        setProgress(0);
        setProgressMessage('');
        setErrorMessage('');
    }, []);

    const startClassification = useCallback(async () => {
        try {
            setStatus('loading_songs');
            setProgress(0);
            setProgressMessage('Requesting permissions...');
            setErrorMessage('');

            // Clear any stale data from previous failed runs
            await AsyncStorage.removeItem('Msick-genre-map');
            await AsyncStorage.removeItem('Msick-genre-classified');
            setGenreMap({});
            setHasClassified(false);

            // Request permissions
            const { status: permStatus } = await MediaLibrary.requestPermissionsAsync();
            if (permStatus !== 'granted') {
                setErrorMessage('Media library permission is required');
                setStatus('error');
                return;
            }

            setProgressMessage('Loading songs from device...');
            setProgress(5);

            // Load all audio files
            const media = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.audio,
                first: 500,
            });

            const allSongs = media.assets.map(a => ({
                id: a.id,
                filename: a.filename,
            }));

            const songs = allSongs;

            if (songs.length === 0) {
                setErrorMessage('No songs found on device');
                setStatus('error');
                return;
            }

            setProgress(10);
            setProgressMessage(`Found ${songs.length} songs. Starting AI analysis...`);
            setStatus('classifying');

            // Classify with progress
            const result = await classifyAllSongs(songs, (completed, total, batchDesc) => {
                const classifyProgress = 10 + (completed / total) * 60; // 10% to 70%
                setProgress(Math.round(classifyProgress));
                setProgressMessage(`Analyzing: ${completed}/${total} songs classified\n${batchDesc}`);
            });

            setGenreMap(result);
            setProgress(75);
            setProgressMessage('Classification complete! Creating playlists...');
            setStatus('creating_playlists');

            // Auto-create playlists for each genre that has songs
            const genreSongMap: Record<string, typeof songs> = {};
            for (const [songId, genre] of Object.entries(result)) {
                if (!genreSongMap[genre]) genreSongMap[genre] = [];
                const songData = media.assets.find(a => a.id === songId);
                if (songData) {
                    genreSongMap[genre].push({ id: songData.id, filename: songData.filename });
                }
            }

            let playlistsCreated = 0;
            const genresWithSongs = Object.entries(genreSongMap).filter(([_, s]) => s.length > 0);

            for (const [genre, genreSongs] of genresWithSongs) {
                const playlistName = `🎵 ${genre}`;
                // Check if playlist already exists
                const existing = playlists.find(p => p.name === playlistName);
                if (!existing) {
                    await createPlaylist(playlistName);
                    playlistsCreated++;

                    // Small delay to ensure playlist is created before adding songs
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                const playlistProgress = 75 + (playlistsCreated / genresWithSongs.length) * 20;
                setProgress(Math.round(playlistProgress));
                setProgressMessage(`Creating playlist: ${playlistName} (${genreSongs.length} songs)`);
            }

            // Now add songs to playlists — we need to reload playlists from storage
            // since createPlaylist updates state asynchronously
            const storedPlaylistsRaw = await AsyncStorage.getItem('Msick-playlists');
            const storedPlaylists: Playlist[] = storedPlaylistsRaw ? JSON.parse(storedPlaylistsRaw) : [];

            for (const [genre, genreSongs] of genresWithSongs) {
                const playlistName = `🎵 ${genre}`;
                const playlist = storedPlaylists.find(p => p.name === playlistName);
                if (playlist) {
                    for (const song of genreSongs) {
                        const fullSongData = media.assets.find(a => a.id === song.id);
                        if (fullSongData) {
                            const songObj: Song = {
                                id: fullSongData.id,
                                filename: fullSongData.filename,
                                uri: fullSongData.uri,
                                duration: fullSongData.duration,
                            };
                            // Add to playlist if not already there
                            const alreadyExists = playlist.songs.some(s => s.id === songObj.id);
                            if (!alreadyExists) {
                                playlist.songs.push(songObj);
                            }
                        }
                    }
                }
            }

            // Save updated playlists with songs
            await AsyncStorage.setItem('Msick-playlists', JSON.stringify(storedPlaylists));

            setProgress(100);
            setProgressMessage(`Done! Classified ${songs.length} songs into ${genresWithSongs.length} genres.`);
            setStatus('done');
            setHasClassified(true);
            await AsyncStorage.setItem(CLASSIFIED_FLAG_KEY, 'true');

        } catch (error) {
            console.error('Classification error:', error);
            setErrorMessage(`Classification failed: ${error}`);
            setStatus('error');
        }
    }, [playlists, createPlaylist, addSongToPlaylist]);

    return (
        <GenreContext.Provider
            value={{
                genreMap,
                status,
                progress,
                progressMessage,
                errorMessage,
                startClassification,
                getGenre,
                getSongsByGenre,
                genreCounts,
                hasClassified,
                resetClassification,
            }}
        >
            {children}
        </GenreContext.Provider>
    );
}

export const useGenre = () => useContext(GenreContext);
