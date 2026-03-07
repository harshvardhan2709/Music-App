import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Song = {
    id: string;
    filename: string;
    uri: string;
    duration?: number;
    [key: string]: any;
};

export type Playlist = {
    id: string;
    name: string;
    songs: Song[];
    createdAt: number;
};

type PlaylistsContextType = {
    playlists: Playlist[];
    createPlaylist: (name: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => Promise<void>;
    renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
    addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
    removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
};

const PlaylistsContext = createContext<PlaylistsContextType>({
    playlists: [],
    createPlaylist: async () => { },
    deletePlaylist: async () => { },
    renamePlaylist: async () => { },
    addSongToPlaylist: async () => { },
    removeSongFromPlaylist: async () => { },
});

const STORAGE_KEY = 'Msick-playlists';

export function PlaylistsProvider({ children }: { children: React.ReactNode }) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setPlaylists(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load playlists', e);
        }
    };

    const savePlaylists = async (newPlaylists: Playlist[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaylists));
            setPlaylists(newPlaylists);
        } catch (e) {
            console.error('Failed to save playlists', e);
        }
    };

    const createPlaylist = async (name: string) => {
        const newPlaylist: Playlist = {
            id: Date.now().toString(),
            name,
            songs: [],
            createdAt: Date.now(),
        };
        await savePlaylists([...playlists, newPlaylist]);
    };

    const deletePlaylist = async (playlistId: string) => {
        await savePlaylists(playlists.filter(p => p.id !== playlistId));
    };

    const renamePlaylist = async (playlistId: string, newName: string) => {
        const updated = playlists.map(p =>
            p.id === playlistId ? { ...p, name: newName } : p
        );
        await savePlaylists(updated);
    };

    const addSongToPlaylist = async (playlistId: string, song: Song) => {
        const updated = playlists.map(p => {
            if (p.id === playlistId) {
                // Avoid duplicates if needed, or allow them. Let's allow for now or check by ID.
                const exists = p.songs.some(s => s.id === song.id);
                if (exists) return p;
                return { ...p, songs: [...p.songs, song] };
            }
            return p;
        });
        await savePlaylists(updated);
    };

    const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
        const updated = playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, songs: p.songs.filter(s => s.id !== songId) };
            }
            return p;
        });
        await savePlaylists(updated);
    };

    return (
        <PlaylistsContext.Provider
            value={{
                playlists,
                createPlaylist,
                deletePlaylist,
                renamePlaylist,
                addSongToPlaylist,
                removeSongFromPlaylist,
            }}
        >
            {children}
        </PlaylistsContext.Provider>
    );
}

export const usePlaylists = () => useContext(PlaylistsContext);
