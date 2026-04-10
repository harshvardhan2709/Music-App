import * as FileSystem from 'expo-file-system/legacy';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SongMetadata {
    title?: string;
    artist?: string;
    album?: string;
    artwork?: string; // base64 data URI
}

const METADATA_CACHE_PREFIX = 'Msick-metadata-';

export async function getSongMetadata(uri: string, songId: string): Promise<SongMetadata | null> {
    try {
        // 1. Check cache first
        const cacheKey = `${METADATA_CACHE_PREFIX}${songId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                // If it's an old base64 cache, invalidate it to save space
                if (parsed.artwork && parsed.artwork.startsWith('data:image')) {
                    // fallthrough to re-parse and save as file
                } else {
                    return parsed;
                }
            } catch (e) {
                // JSON parse error, ignore and fall through
            }
        }

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
            
            // Save to FileSystem instead of AsyncStorage to prevent SQLITE_FULL
            const ext = picture.format === 'image/png' ? 'png' : 'jpg';
            // Use legacy cacheDirectory (ensure it ends with / )
            const baseUrl = FileSystem.cacheDirectory?.endsWith('/') ? FileSystem.cacheDirectory : `${FileSystem.cacheDirectory}/`;
            const fileUri = `${baseUrl}art_${songId}.${ext}`;
            
            await FileSystem.writeAsStringAsync(fileUri, base64Art, {
                encoding: 'base64'
            });
            
            result.artwork = fileUri;
        }

        // 3. Save to cache
        try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (storageError: any) {
            if (storageError.message && storageError.message.includes('SQLITE_FULL')) {
                console.warn('AsyncStorage full. Attempting to clear metadata cache.');
                await clearMetadataCache();
                // Try saving again after clearing
                await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
            }
        }

        return result;
    } catch (error) {
        console.warn(`Error extracting metadata for ${uri}:`, error);
        return null;
    }
}

export async function clearMetadataCache(): Promise<void> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const metadataKeys = keys.filter(k => k.startsWith(METADATA_CACHE_PREFIX));
        await AsyncStorage.multiRemove(metadataKeys);
    } catch (e) {
        console.error('Failed to clear metadata cache', e);
    }
}
