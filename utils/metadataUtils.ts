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
let _isScanning = false;
let _currentLibraryIds: string[] = [];

// Queue system to prevent overwhelming the bridge with heavy file reads
let _activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 1; // Reduced to 1 for better UI performance
const _requestQueue: (() => void)[] = [];
const _pendingIds = new Set<string>();

async function acquireLock(priority: boolean = false) {
    if (_activeRequests < MAX_CONCURRENT_REQUESTS) {
        _activeRequests++;
        return;
    }
    return new Promise<void>(resolve => {
        if (priority) _requestQueue.unshift(resolve);
        else _requestQueue.push(resolve);
    });
}

function releaseLock() {
    _activeRequests--;
    if (_requestQueue.length > 0) {
        _activeRequests++;
        const next = _requestQueue.shift();
        next?.();
    }
}

const CACHE_VERSION = 'v2'; // Increment this to force a cache reset
const CACHE_VER_KEY = '__msick_metadata_cache_ver__';

/**
 * Batch-preload all cached metadata from SQLite into memory.
 */
export async function preloadMetadataCache(): Promise<void> {
    try {
        const db = await getDatabase();
        
        // Check for version mismatch — force clear if logic changed
        const { value: storedVer } = await db.getFirstAsync<{ value: string }>('SELECT value FROM key_value_store WHERE key = ?', [CACHE_VER_KEY]) || { value: null };
        
        if (storedVer !== CACHE_VERSION) {
            console.log(`[Metadata] Cache version mismatch (${storedVer} vs ${CACHE_VERSION}). Clearing cache...`);
            await db.runAsync('DELETE FROM metadata_cache');
            await db.runAsync('INSERT OR REPLACE INTO key_value_store (key, value) VALUES (?, ?)', [CACHE_VER_KEY, CACHE_VERSION]);
            // Do not return — allow the code below to proceed with 0 rows
        }
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

/**
 * Synchronous check for cached metadata.
 * Use this in UI components for instant rendering.
 */
export function getCachedMetadata(songId: string): SongMetadata | null {
    return _memoryCache.get(songId) || null;
}

/**
 * Get current scanning stats based on the provided list of song IDs
 */
export function getMetadataStats() {
    if (_currentLibraryIds.length === 0) {
        return { cached: 0, total: 0, isScanning: _isScanning };
    }

    let cachedCount = 0;
    for (const id of _currentLibraryIds) {
        if (_memoryCache.has(id)) {
            cachedCount++;
        }
    }

    return {
        cached: cachedCount,
        total: _currentLibraryIds.length,
        isScanning: _isScanning || _activeRequests > 0 || _requestQueue.length > 0
    };
}

export async function getSongMetadata(uri: string, songId: string, priority: boolean = true): Promise<SongMetadata | null> {
    // 1. Check in-memory cache first (instant)
    if (_memoryCache.has(songId)) {
        return _memoryCache.get(songId)!;
    }

    // 2. Prevent duplicate active requests for the same song
    if (_pendingIds.has(songId)) {
        // If it's already pending, we don't want to queue it again.
        // But we can't easily "wait" for the other request here without complex logic.
        // Returning null for now as the other request will eventually populate the cache.
        return null;
    }

    _pendingIds.add(songId);

    try {
        // 3. Queue the request to avoid freezing the UI
        await acquireLock(priority);

        // 3. Cache miss — extract from file
        const readSize = 1024 * 1024; 
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
            length: readSize,
            position: 0
        });

        const buffer = Buffer.from(base64, 'base64');
        const metadata = await mm.parseBuffer(buffer);

        console.log(`[Metadata] Parsing ${uri.split('/').pop()} - Format: ${metadata.format.container}`);

        const result: SongMetadata = {
            title: metadata.common.title,
            artist: metadata.common.artist,
            album: metadata.common.album,
        };

        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const base64Art = picture.data.toString('base64');
            


            let ext = 'jpg';
            if (picture.format === 'image/png') ext = 'png';
            else if (picture.format === 'image/gif') ext = 'gif';
            
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) throw new Error('Cache directory not available');

            const baseUrl = cacheDir.endsWith('/') ? cacheDir : `${cacheDir}/`;
            const fileUri = `${baseUrl}art_${songId}.${ext}`;
            
            await FileSystem.writeAsStringAsync(fileUri, base64Art, {
                encoding: 'base64'
            });
            
            result.artwork = fileUri;
        } else {

        }

        // 4. Save to memory + SQLite
        _memoryCache.set(songId, result);
        
        const db = await getDatabase();
        // Await the write to ensure it persists before we finish this queue item
        await db.runAsync(
            'INSERT OR REPLACE INTO metadata_cache (song_id, title, artist, album, artwork) VALUES (?, ?, ?, ?, ?)',
            [songId, result.title ?? null, result.artist ?? null, result.album ?? null, result.artwork ?? null]
        );

        return result;
    } catch (error) {
        // Fail silently to avoid terminal clutter for unsupported/system files
        _memoryCache.set(songId, null);
        return null;
    } finally {
        _pendingIds.delete(songId);
        releaseLock();
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
export async function startBackgroundMetadataScan(assets: { id: string, uri: string }[]) {
    _currentLibraryIds = assets.map(a => a.id);
    if (_isScanning) return;
    _isScanning = true;
    
    console.log(`[Metadata] Starting background scan for ${assets.length} songs...`);
    
    try {
        for (const asset of assets) {
            // Only process if not in memory AND not already in the queue
            if (!_memoryCache.has(asset.id) && !_pendingIds.has(asset.id)) {
                // Trigger extraction — the queue handles concurrency
                // Background scan uses priority=false
                getSongMetadata(asset.uri, asset.id, false).catch(() => {});
                
                // Every 5 songs, wait longer to let other UI tasks through
                if (assets.indexOf(asset) % 5 === 0) {
                    await new Promise(r => setTimeout(r, 200));
                }
            }
        }
    } catch (e) {
        console.warn('[Metadata] Background scan interrupted:', e);
    } finally {
        _isScanning = false;
        console.log('[Metadata] Background scan tasks queued.');
    }
}
