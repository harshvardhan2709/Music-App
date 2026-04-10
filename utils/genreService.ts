import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom genre categories as requested
export const GENRE_LIST = [
    'Phonk',
    'Feel Good',
    'Party',
    'Chill',
    'Meaningful',
    'Ringtone Worthy',
    'Uncategorized',
] as const;

export type GenreType = (typeof GENRE_LIST)[number];

// Genre colors for UI display
export const GENRE_COLORS: Record<GenreType, { bg: string; border: string; icon: string }> = {
    'Phonk': { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', icon: '#ef4444' },
    'Feel Good': { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)', icon: '#22c55e' },
    'Party': { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.35)', icon: '#f97316' },
    'Chill': { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)', icon: '#3b82f6' },
    'Meaningful': { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)', icon: '#a855f7' },
    'Ringtone Worthy': { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.35)', icon: '#ec4899' },
    'Uncategorized': { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.35)', icon: '#94a3b8' },
};

// Genre icons (FontAwesome icon names)
export const GENRE_ICONS: Record<GenreType, string> = {
    'Phonk': 'bolt',
    'Feel Good': 'sun-o',
    'Party': 'glass',
    'Chill': 'leaf',
    'Meaningful': 'heart',
    'Ringtone Worthy': 'bell',
    'Uncategorized': 'question-circle',
};

// =========================================================================
// GROQ API CONFIG
// =========================================================================
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GENRE_STORAGE_KEY = 'Msick-genre-map';
const BATCH_SIZE = 30;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 3000;

type SongInput = {
    id: string;
    filename: string;
};

type GenreMap = Record<string, GenreType>;

// =========================================================================
// SMART LOCAL CLASSIFIER (Fallback & Helper)
// =========================================================================

const GENRE_KEYWORDS: Record<GenreType, string[]> = {
    'Phonk': [
        'phonk', 'drift', 'cowbell', 'memphis', 'funk', 'brazilian', 'mtg', 'mrd',
        'kordhell', 'freddie dredd', 'dxrk', 'ghostface playa', 'sxmpra',
        'sigma', 'gigachad', 'slowed', 'sped up', 'lxst cxntury', 'hensonn',
    ],
    'Feel Good': [
        'happy', 'feel good', 'good vibes', 'positive', 'motivat', 'uplifting',
        'sunshine', 'smile', 'beautiful', 'joy', 'wonderful', 'blessed',
    ],
    'Party': [
        'party', 'club', 'dance', 'dj', 'edm', 'banger', 'remix', 'house',
        'techno', 'bass drop', 'hype', 'lit', 'turn up', 'night',
    ],
    'Chill': [
        'chill', 'lofi', 'lo-fi', 'relax', 'calm', 'peace', 'ambient',
        'sleep', 'study', 'soft', 'gentle', 'acoustic', 'jazz', 'night drive',
    ],
    'Meaningful': [
        'meaningful', 'deep', 'emotional', 'soul', 'heart', 'love', 'pain',
        'sad', 'truth', 'life', 'story', 'message', 'struggle', 'real',
    ],
    'Ringtone Worthy': [
        'ringtone', 'ton', 'alarm', 'short', 'intro', 'hook', 'jingle',
        'theme', 'bgm', 'ost', 'opening', 'ending', 'instrumental',
    ],
    'Uncategorized': [],
};

function classifyLocally(filename: string): GenreType {
    const name = filename.toLowerCase();
    
    // Check Phonk specifically first because "funk" is common
    for (const kw of GENRE_KEYWORDS.Phonk) {
        if (name.includes(kw)) return 'Phonk';
    }

    for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
        if (genre === 'Phonk' || genre === 'Uncategorized') continue;
        for (const kw of keywords) {
            if (name.includes(kw)) return genre as GenreType;
        }
    }

    return 'Uncategorized';
}

// =========================================================================
// API LOGIC
// =========================================================================

export async function loadGenreMap(): Promise<GenreMap> {
    try {
        const stored = await AsyncStorage.getItem(GENRE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

export async function saveGenreMap(genreMap: GenreMap): Promise<void> {
    try {
        await AsyncStorage.setItem(GENRE_STORAGE_KEY, JSON.stringify(genreMap));
    } catch (e) {
        console.error('Failed to save genre map', e);
    }
}

function buildMessages(songs: { id: string; filename: string }[]) {
    const genreOptions = GENRE_LIST.join(', ');
    const songList = songs
        .map((s) => `[${s.id}] ${s.filename}`)
        .join('\n');

    return [
        {
            role: 'system',
            content: `You are a music genre classifier. You classify songs into exactly one genre based on filename.
IMPORTANT: Categorize both "Phonk" and any kind of "Funk" (like Brazilian Funk, Drift Funk, MTG) under the "Phonk" genre.
Genres: ${genreOptions}
- Phonk: Includes Phonk, Funk (Brazilian/Drift), Dark, aggressive, Memphis rap, cowbell beats, sigma/gigachad music.
- Feel Good: Uplifting, happy, positive vibes, motivational, cheerful.
- Party: Dance, club, EDM, high energy, electronic bangers.
- Chill: Relaxing, lo-fi, ambient, calm, peaceful, study music.
- Meaningful: Deep lyrics, emotional, soulful, powerful messages, ballads.
- Ringtone Worthy: Catchy hooks, iconic intros, short tunes, notification sounds.
- Uncategorized: Doesn't fit above categories, unknown, recordings.
Respond ONLY with raw JSON: {"songId": "Genre"}`,
        },
        {
            role: 'user',
            content: `Classify these songs:\n${songList}`,
        },
    ];
}

async function classifyBatch(songs: SongInput[], retryCount = 0): Promise<GenreMap> {
    const messages = buildMessages(songs);

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                temperature: 0.1,
                max_tokens: 2048,
                response_format: { type: 'json_object' },
            }),
        });

        if (response.status === 429 && retryCount < MAX_RETRIES) {
            const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
            console.log(`Rate limited. Retrying in ${retryDelay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return classifyBatch(songs, retryCount + 1);
        }

        if (!response.ok) {
            console.error('Groq Error, using local fallback');
            const result: GenreMap = {};
            songs.forEach(s => result[s.id] = classifyLocally(s.filename));
            return result;
        }

        const data = await response.json();
        const textContent = data?.choices?.[0]?.message?.content || '';

        try {
            const result: GenreMap = JSON.parse(textContent);
            const validatedResult: GenreMap = {};
            for (const song of songs) {
                const genre = result[song.id];
                if (genre && GENRE_LIST.includes(genre as GenreType)) {
                    validatedResult[song.id] = genre as GenreType;
                } else {
                    validatedResult[song.id] = classifyLocally(song.filename);
                }
            }
            return validatedResult;
        } catch {
            const result: GenreMap = {};
            songs.forEach(s => result[s.id] = classifyLocally(s.filename));
            return result;
        }
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return classifyBatch(songs, retryCount + 1);
        }
        const result: GenreMap = {};
        songs.forEach(s => result[s.id] = classifyLocally(s.filename));
        return result;
    }
}

export async function classifyAllSongs(
    songs: SongInput[],
    onProgress: (completed: number, total: number, currentBatch: string) => void,
): Promise<GenreMap> {
    const totalSongs = songs.length;
    const allResults: GenreMap = {};
    let completed = 0;

    const batches: SongInput[][] = [];
    for (let i = 0; i < songs.length; i += BATCH_SIZE) {
        batches.push(songs.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        onProgress(completed, totalSongs, `🤖 Batch ${i+1}/${batches.length}`);
        const batchResult = await classifyBatch(batch);
        Object.assign(allResults, batchResult);
        completed += batch.length;
        onProgress(completed, totalSongs, `Done ${completed}/${totalSongs}`);
        if (i < batches.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    const existing = await loadGenreMap();
    const merged = { ...existing, ...allResults };
    await saveGenreMap(merged);
    return merged;
}
