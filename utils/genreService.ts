import { loadGenreMapFromDB, saveGenreMapToDB } from "./database";

// Dynamic Genre System - No predefined list
export type GenreType = string;

/**
 * Generates a consistent, aesthetic HSL color based on a string hash.
 * This allows dynamic genres to have unique but harmonious colors.
 */
export function getGenreStyle(genre: string) {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = Math.abs(hash % 360);
  return {
    bg: `hsla(${h}, 70%, 50%, 0.15)`,
    border: `hsla(${h}, 70%, 50%, 0.35)`,
    iconColor: `hsl(${h}, 80%, 65%)`,
  };
}

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

type GenreMap = Record<string, GenreType[]>;

// =========================================================================
// SMART LOCAL CLASSIFIER (Fallback & Helper)
// =========================================================================

const GENRE_KEYWORDS: Record<string, string[]> = {
  "Pop": ["pop", "hits", "top", "mainstream", "billboard", "dua lipa", "justin bieber", "ariana grande", "billie eilish", "shawn mendes", "charlie puth"],
  "Rock": ["rock", "metal", "grunge", "punk", "indie", "alternative", "coldplay", "imagine dragons", "maroon"],
  "Hip-Hop": ["hip hop", "trap", "urban", "beats", "lofi", "drake", "travis scott", "kanye", "kendrick", "post malone", "ap dhillon", "divine", "emiway"],
  "Rap": ["rap", "freestyle", "drill", "lyrical", "eminem", "sidhu", "raftaar"],
  "EDM & Dance": ["dance", "edm", "house", "techno", "electronic", "dj", "club", "party", "remix", "bass drop"],
  "Lo-fi & Chill": ["chill", "lofi", "study", "relax", "mellow", "ambient", "the weeknd"],
  "Phonk": ["phonk", "drift", "cowbell", "sigma", "gigachad", "kordhell", "dxrk", "ghostface playa"],
  "Bollywood": ["bollywood", "hindi", "indian", "t-series", "arijit", "badshah", "neha kakkar", "shreya ghoshal", "kumar sanu", "kishore", "lata", "rafi", "ar rahman", "pritam", "vishal", "tanishk", "jubin", "darshan raval", "b praak", "guru randhawa", "yo yo", "diljit"],
  "Classical & Piano": ["classical", "piano", "violin", "orchestra", "symphony", "instrumental", "bgm", "ost"],
  "Jazz & Blues": ["jazz", "blues", "soul", "funk", "smooth"],
  "R&B & Soul": ["r&b", "soul", "gospel", "sza", "beyonce", "rihanna", "bruno mars"],
  "Country": ["country", "folk", "acoustic", "banjo", "taylor swift", "ed sheeran"],
  "Metal": ["metal", "heavy", "death", "thrash", "doom"],
  "Reggae & Afrobeat": ["reggae", "afro", "dancehall", "riddim", "lil nas"],
  "Gaming & OST": ["gaming", "ost", "theme", "background", "bgm", "soundtrack", "ringtone", "alarm", "jingle"],
  "Acoustic & Folk": ["acoustic", "folk", "unplugged", "guitar", "harry styles", "olivia rodrigo"],
  "Devotional": ["devotional", "bhajan", "spiritual", "god", "prayer", "mantra", "aarti", "sufi", "qawwali", "ghazal"],
  "Latin": ["latin", "reggaeton", "salsa", "bachata", "doja cat"],
  "Retro Hits": ["retro", "old", "80s", "90s", "classic", "vintage", "disco"],
  "Kids & Nursery": ["kids", "nursery", "baby", "lullaby", "children"]
};

function classifyLocally(filename: string): GenreType[] {
  const name = filename.toLowerCase();
  const found: Set<GenreType> = new Set();

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    for (const kw of keywords) {
      if (name.includes(kw)) {
        found.add(genre as GenreType);
        break;
      }
    }
  }

  if (found.size === 0) return ["Pop"];
  return Array.from(found).slice(0, 3);
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

const POPULAR_GENRES = [
  "Pop", "Rock", "Hip-Hop", "Rap", "EDM & Dance", 
  "Lo-fi & Chill", "Phonk", "Bollywood", "Classical & Piano", "Jazz & Blues",
  "R&B & Soul", "Country", "Metal", "Reggae & Afrobeat", "Gaming & OST",
  "Acoustic & Folk", "Devotional", "Latin", "Retro Hits", "Kids & Nursery"
];

function buildMessages(songs: { id: string; filename: string }[]) {
  const songList = songs.map((s) => `[${s.id}] ${s.filename}`).join("\n");

  return [
    {
      role: "system",
      content: `You are a music librarian. For each song provided, assign 1-3 tags strictly from the following list of 20 popular genres:
${POPULAR_GENRES.join(", ")}.

Rules:
1. ONLY use tags from the provided list.
2. If a song fits multiple (e.g. a Bollywood Pop song), assign both.
3. Be as accurate as possible based on the filename.

Respond ONLY with raw JSON: {"songId": ["Tag1", "Tag2"]}`,
    },
    {
      role: "user",
      content: `Analyze these songs and map them to the 20 genres:\n${songList}`,
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
      const result: Record<string, string | string[]> = JSON.parse(textContent);
      const validatedResult: GenreMap = {};
      for (const song of songs) {
        let tags = result[song.id];

        // Normalize to array
        if (typeof tags === "string") tags = [tags];

        if (Array.isArray(tags) && tags.length > 0) {
          validatedResult[song.id] = tags
            .map((t) => String(t).trim())
            .filter(Boolean);
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
