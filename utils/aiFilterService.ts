import * as MediaLibrary from "expo-media-library";

// =========================================================================
// AI SMART FILTER — User-prompted song filtering via Groq AI
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

/**
 * Sends a batch of songs + user prompt to the AI and returns matching song IDs.
 */
async function filterBatch(
  songs: SongInput[],
  userPrompt: string,
  retryCount = 0,
): Promise<string[]> {
  const songList = songs.map((s) => `[${s.id}] ${s.filename}`).join("\n");

  const messages = [
    {
      role: "system",
      content: `You are a music recommendation assistant. The user will give you a request describing what kind of songs they want. You will be given a list of songs (with IDs and filenames). Your job is to pick the songs that best match the user's request based on the filename.

Rules:
- Return ONLY a JSON object with a single key "ids" containing an array of matching song IDs: {"ids": ["id1", "id2"]}
- If no songs match, return an empty array: {"ids": []}
- Be generous but relevant — if a song filename reasonably fits the request, include it.
- Judge based on song name, artist name, and any other info in the filename.
- Return raw JSON only, no explanation.`,
    },
    {
      role: "user",
      content: `Request: "${userPrompt}"\n\nSongs:\n${songList}`,
    },
  ];

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
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return filterBatch(songs, userPrompt, retryCount + 1);
    }

    if (!response.ok) {
      console.error("Groq error in AI filter:", response.status);
      return [];
    }

    const data = await response.json();
    const textContent = data?.choices?.[0]?.message?.content || "";
    console.log("AI Filter Raw Response:", textContent);

    try {
      const parsed = JSON.parse(textContent);
      // Handle both {"results": [...]} and [...] formats
      const ids: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.results)
          ? parsed.results
          : Array.isArray(parsed.songs)
            ? parsed.songs
            : Array.isArray(parsed.ids)
              ? parsed.ids
              : [];

      // Validate — only keep IDs that exist in our song list
      const validIds = new Set(songs.map((s) => s.id));
      const matchedIds = ids.map(String).filter((id) => validIds.has(id));
      console.log(
        `Matched ${matchedIds.length} out of ${ids.length} IDs returned by AI`,
      );
      return matchedIds;
    } catch (e) {
      console.error("Failed to parse AI filter response:", e);
      return [];
    }
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return filterBatch(songs, userPrompt, retryCount + 1);
    }
    console.error("AI filter error:", error);
    return [];
  }
}

/**
 * Filters all songs using AI based on a user prompt.
 * Returns full MediaLibrary assets that matched.
 */
export async function aiSmartFilter(
  userPrompt: string,
  onProgress?: (message: string) => void,
): Promise<MediaLibrary.Asset[]> {
  onProgress?.("Requesting permissions...");

  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Media library permission required");
  }

  onProgress?.("Loading songs from device...");

  const media = await MediaLibrary.getAssetsAsync({
    mediaType: MediaLibrary.MediaType.audio,
    first: 500,
  });

  const allSongs: SongInput[] = media.assets.map((a) => ({
    id: a.id,
    filename: a.filename,
  }));

  if (allSongs.length === 0) {
    throw new Error("No songs found on device");
  }

  // Split into batches
  const batches: SongInput[][] = [];
  for (let i = 0; i < allSongs.length; i += BATCH_SIZE) {
    batches.push(allSongs.slice(i, i + BATCH_SIZE));
  }

  const matchedIds: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    onProgress?.(`Analyzing batch ${i + 1}/${batches.length}...`);
    const batchResult = await filterBatch(batches[i], userPrompt);
    matchedIds.push(...batchResult);

    // Rate limit buffer between batches
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Map matched IDs back to full assets
  const matchedSet = new Set(matchedIds);
  const matchedAssets = media.assets.filter((a) => matchedSet.has(a.id));

  onProgress?.(`Found ${matchedAssets.length} matching songs`);

  return matchedAssets;
}
