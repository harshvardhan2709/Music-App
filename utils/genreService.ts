import { loadGenreMapFromDB, saveGenreMapToDB } from "./database";

// Custom genre categories as requested
export const GENRE_LIST = [
  "Phonk",
  "Party",
  "Ringtone Worthy",
  "English",
  "Indian Music",
  "Uncategorized",
] as const;

export type GenreType = (typeof GENRE_LIST)[number];

// Genre colors for UI display
export const GENRE_COLORS: Record<
  GenreType,
  { bg: string; border: string; icon: string }
> = {
  Phonk: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.35)",
    icon: "#ef4444",
  },
  Party: {
    bg: "rgba(249, 115, 22, 0.15)",
    border: "rgba(249, 115, 22, 0.35)",
    icon: "#f97316",
  },
  "Ringtone Worthy": {
    bg: "rgba(236, 72, 153, 0.15)",
    border: "rgba(236, 72, 153, 0.35)",
    icon: "#ec4899",
  },
  English: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.35)",
    icon: "#3b82f6",
  },
  "Indian Music": {
    bg: "rgba(168, 85, 247, 0.15)",
    border: "rgba(168, 85, 247, 0.35)",
    icon: "#a855f7",
  },
  Uncategorized: {
    bg: "rgba(148, 163, 184, 0.15)",
    border: "rgba(148, 163, 184, 0.35)",
    icon: "#94a3b8",
  },
};

// Genre icons (FontAwesome icon names)
export const GENRE_ICONS: Record<GenreType, string> = {
  Phonk: "bolt",
  Party: "glass",
  "Ringtone Worthy": "bell",
  English: "globe",
  "Indian Music": "star",
  Uncategorized: "question-circle",
};

// =========================================================================
// GROQ API CONFIG
// =========================================================================
const GROQ_API_KEY =
  process.env.EXPO_PUBLIC_GROQ_API_KEY ||
  "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

const BATCH_SIZE = 75;
const MAX_RETRIES = 4;
const BASE_RETRY_DELAY_MS = 5000;

type SongInput = {
  id: string;
  filename: string;
};

type GenreMap = Record<string, GenreType>;

// =========================================================================
// SMART LOCAL CLASSIFIER (Fallback & Helper)
// =========================================================================

const GENRE_KEYWORDS: Record<GenreType, string[]> = {
  Phonk: [
    "phonk",
    "cowbell",
    "memphis rap",
    "kordhell",
    "freddie dredd",
    "dxrk",
    "ghostface playa",
    "sxmpra",
    "gigachad",
    "lxst cxntury",
    "hensonn",
    "brazilian phonk",
    "drift phonk",
    "brazilian funk",
    "funk phonk",
    "mtg funk",
  ],
  Party: [
    "party",
    "club",
    "dance",
    "dj",
    "edm",
    "banger",
    "remix",
    "house",
    "techno",
    "bass drop",
    "hype",
    "lit",
    "turn up",
    "night",
  ],
  "Ringtone Worthy": [
    "ringtone",
    "ton",
    "alarm",
    "short",
    "intro",
    "hook",
    "jingle",
    "theme",
    "bgm",
    "ost",
    "opening",
    "ending",
    "instrumental",
  ],
  "Indian Music": [
    "bollywood",
    "hindi",
    "punjabi",
    "desi",
    "bhangra",
    "arijit",
    "atif",
    "badshah",
    "neha kakkar",
    "shreya ghoshal",
    "kumar sanu",
    "kishore",
    "lata",
    "rafi",
    "ar rahman",
    "pritam",
    "vishal",
    "tanishk",
    "jubin",
    "darshan raval",
    "b praak",
    "guru randhawa",
    "yo yo",
    "raftaar",
    "divine",
    "emiway",
    "sidhu",
    "ap dhillon",
    "diljit",
    "garry sandhu",
    "harrdy sandhu",
    "jassie gill",
    "kaka",
    "pawan singh",
    "khesari",
    "tamil",
    "telugu",
    "kannada",
    "marathi",
    "bhojpuri",
    "gujarati",
    "sufi",
    "ghazal",
    "qawwali",
    "devotional",
    "bhajan",
    "aarti",
  ],
  English: [
    "english",
    "pop",
    "rock",
    "hip hop",
    "rap",
    "r&b",
    "country",
    "drake",
    "taylor swift",
    "ed sheeran",
    "eminem",
    "the weeknd",
    "dua lipa",
    "justin bieber",
    "ariana grande",
    "billie eilish",
    "post malone",
    "travis scott",
    "kanye",
    "kendrick",
    "beyonce",
    "rihanna",
    "bruno mars",
    "coldplay",
    "imagine dragons",
    "maroon",
    "one direction",
    "bts",
    "blackpink",
    "charlie puth",
    "shawn mendes",
    "lil nas",
    "doja cat",
    "sza",
    "olivia rodrigo",
    "harry styles",
  ],
  Uncategorized: [],
};

function classifyLocally(filename: string): GenreType {
  const name = filename.toLowerCase();

  // Check Indian Music before English since Indian artists may have English words
  for (const kw of GENRE_KEYWORDS["Indian Music"]) {
    if (name.includes(kw)) return "Indian Music";
  }

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    if (genre === "Indian Music" || genre === "Uncategorized") continue;
    for (const kw of keywords) {
      if (name.includes(kw)) return genre as GenreType;
    }
  }

  return "Uncategorized";
}

// =========================================================================
// API LOGIC
// =========================================================================

export async function loadGenreMap(): Promise<GenreMap> {
  try {
    const map = await loadGenreMapFromDB();
    return map as GenreMap;
  } catch {
    return {};
  }
}

export async function saveGenreMap(genreMap: GenreMap): Promise<void> {
  try {
    await saveGenreMapToDB(genreMap);
  } catch (e) {
    console.error("Failed to save genre map", e);
  }
}

function buildMessages(songs: { id: string; filename: string }[]) {
  const genreOptions = GENRE_LIST.join(", ");
  const songList = songs.map((s) => `[${s.id}] ${s.filename}`).join("\n");

  return [
    {
      role: "system",
      content: `You are a music genre classifier. You classify songs into exactly one genre based on filename.
Be strict about Phonk — only classify songs as Phonk if the filename clearly indicates phonk, drift phonk, Brazilian phonk/funk, or known phonk artists. Do NOT classify regular songs as Phonk just because they sound aggressive or have "slowed" or "sped up" in the name.
Genres: ${genreOptions}
- Phonk: ONLY actual Phonk music — drift phonk, Brazilian phonk/funk, Memphis phonk, cowbell beats, known phonk artists (Kordhell, Freddie Dredd, DXRK, Ghostface Playa). NOT regular hip-hop, trap, or aggressive music.
- Party: Dance, club, EDM, high energy, electronic bangers, remix tracks.
- Ringtone Worthy: Catchy hooks, iconic intros, short tunes, notification sounds, instrumentals, BGM/OST.
- English: English language songs — pop, rock, hip hop, rap, R&B, country, alternative, indie, etc.
- Indian Music: Bollywood, Hindi, Punjabi, Tamil, Telugu, Kannada, Marathi, Bhojpuri songs, desi hip-hop, bhangra, Sufi, devotional, ghazals.
- Uncategorized: Doesn't fit above categories, unknown, recordings, or ambiguous.
Respond ONLY with raw JSON: {"songId": "Genre"}`,
    },
    {
      role: "user",
      content: `Classify these songs:\n${songList}`,
    },
  ];
}

async function classifyBatch(
  songs: SongInput[],
  retryCount = 0,
): Promise<GenreMap> {
  const messages = buildMessages(songs);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Rate limited. Retrying in ${retryDelay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return classifyBatch(songs, retryCount + 1);
    }

    if (!response.ok) {
      console.error("Groq Error, using local fallback");
      const result: GenreMap = {};
      songs.forEach((s) => (result[s.id] = classifyLocally(s.filename)));
      return result;
    }

    const data = await response.json();
    const textContent = data?.choices?.[0]?.message?.content || "";

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
      songs.forEach((s) => (result[s.id] = classifyLocally(s.filename)));
      return result;
    }
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return classifyBatch(songs, retryCount + 1);
    }
    const result: GenreMap = {};
    songs.forEach((s) => (result[s.id] = classifyLocally(s.filename)));
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
    onProgress(completed, totalSongs, `🤖 Batch ${i + 1}/${batches.length}`);
    const batchResult = await classifyBatch(batch);
    Object.assign(allResults, batchResult);
    completed += batch.length;
    onProgress(completed, totalSongs, `Done ${completed}/${totalSongs}`);
    if (i < batches.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  // Only save the NEW results — existing entries are already in the DB
  await saveGenreMap(allResults);

  // Return merged map for the UI
  const existing = await loadGenreMap();
  return existing;
}
