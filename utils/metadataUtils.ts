import * as FileSystem from 'expo-file-system/legacy';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import { getDatabase } from './database';

export interface SongMetadata {
    title?: string;
    artist?: string;
    album?: string;
    artwork?: string; // file URI to cached artwork
}

// In-memory cache to avoid repeated DB lookups within the same session
const _memoryCache = new Map<string, SongMetadata | null>();

/**
 * Batch-preload all cached metadata from SQLite into memory.
 * Call this once on app startup to avoid N individual DB queries.
 */
export async function preloadMetadataCache(): Promise<void> {
    try {
        const db = await getDatabase();
        const rows = await db.getAllAsync<{
            song_id: string;
            title: string | null;
            artist: string | null;
            album: string | null;
            artwork: string | null;
        }>('SELECT * FROM metadata_cache');

        for (const row of rows) {
            // Skip old base64 artwork entries
            if (row.artwork && row.artwork.startsWith('data:image')) continue;

            _memoryCache.set(row.song_id, {
                title: row.title ?? undefined,
                artist: row.artist ?? undefined,
                album: row.album ?? undefined,
                artwork: row.artwork ?? undefined,
            });
        }
        console.log(`[Metadata] Preloaded ${_memoryCache.size} cached entries into memory`);
    } catch (e) {
        console.warn('[Metadata] Preload failed:', e);
    }
}

export async function getSongMetadata(uri: string, songId: string): Promise<SongMetadata | null> {
    try {
        // 1. Check in-memory cache first (instant)
        if (_memoryCache.has(songId)) {
            return _memoryCache.get(songId)!;
        }

        // 2. Cache miss — extract from file
        const readSize = 512 * 1024; 
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
            length: readSize,
            position: 0
        });

        const buffer = Buffer.from(base64, 'base64');
        const metadata = await mm.parseBuffer(buffer, { mimeType: 'audio/mpeg' });

        const result: SongMetadata = {
            title: metadata.common.title,
            artist: metadata.common.artist,
            album: metadata.common.album,
        };

        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const base64Art = picture.data.toString('base64');
            
            // Save to FileSystem instead of database to prevent bloating
            const ext = picture.format === 'image/png' ? 'png' : 'jpg';
            const baseUrl = FileSystem.cacheDirectory?.endsWith('/') ? FileSystem.cacheDirectory : `${FileSystem.cacheDirectory}/`;
            const fileUri = `${baseUrl}art_${songId}.${ext}`;
            
            await FileSystem.writeAsStringAsync(fileUri, base64Art, {
                encoding: 'base64'
            });
            
            result.artwork = fileUri;
        }

        // 3. Save to memory + SQLite
        _memoryCache.set(songId, result);
        
        // Fire-and-forget DB write — don't block the UI
        const db = await getDatabase();
        db.runAsync(
            'INSERT OR REPLACE INTO metadata_cache (song_id, title, artist, album, artwork) VALUES (?, ?, ?, ?, ?)',
            [songId, result.title ?? null, result.artist ?? null, result.album ?? null, result.artwork ?? null]
        ).catch(() => {}); // swallow DB write errors

        return result;
    } catch (error) {
        console.warn(`Error extracting metadata for ${uri}:`, error);
        _memoryCache.set(songId, null);
        return null;
    }
}

export async function clearMetadataCache(): Promise<void> {
    try {
        _memoryCache.clear();
        const db = await getDatabase();
        await db.runAsync('DELETE FROM metadata_cache');
    } catch (e) {
        console.error('Failed to clear metadata cache', e);
    }
}
