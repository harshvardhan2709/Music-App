# Msick - Technical Documentation

## 1. Overview
**Msick** is an advanced, local-first music player application built with React Native and Expo. It leverages high-performance native modules and LLM-based intelligence to bridge the gap between traditional local playback and modern AI-driven discovery.

---

## 2. Architecture & Data Flow

Msick follows a "Local-First, AI-Enhanced" architecture:
1. **Asset Discovery:** `expo-media-library` scans the device for audio assets.
2. **Metadata Extraction:** `music-metadata-browser` parses ID3 tags in the background.
3. **Persistent Storage:** Metadata and AI classifications are cached in a relational **SQLite** database.
4. **Intelligence Layer:** Groq API (Llama 3.x) performs zero-shot classification and semantic filtering.
5. **UI Layer:** NativeWind (TailwindCSS) and Reanimated provide a fluid, premium interface.

---

## 3. Database Schema (SQLite)

Msick uses `expo-sqlite` with WAL mode enabled for optimal performance. The database is initialized in `utils/database.ts`.

### `metadata_cache`
Stores extracted ID3 tags to avoid expensive re-parsing.
| Column | Type | Description |
| :--- | :--- | :--- |
| `song_id` | TEXT (PK) | Unique asset ID from MediaLibrary |
| `title` | TEXT | Parsed song title |
| `artist` | TEXT | Parsed artist name |
| `album` | TEXT | Parsed album name |
| `artwork` | TEXT | URI to the cached image in FileSystem |

### `genre_map`
Maps songs to multiple AI-assigned genres.
| Column | Type | Description |
| :--- | :--- | :--- |
| `song_id` | TEXT | Foreign key to asset |
| `genre` | TEXT | Genre name (e.g., "Phonk") |
| *Primary Key* | `(song_id, genre)` | Ensures unique mappings |

### `playlists` & `playlist_songs`
Relational tables for user-defined collections.
- `playlists`: `(id, name, created_at)`
- `playlist_songs`: `(playlist_id, song_id, filename, uri, duration, extra_json, sort_order)`

---

## 4. AI Engine & Prompt Engineering

Msick uses the **Groq API** (specifically Llama 3.1 8B or 3.3 70B) for zero-shot classification.

### Genre Classification (`genreService.ts`)
The system prompt enforces a strict musicology perspective:
- **Constraint:** Must select from a predefined list of 20 genres.
- **Multi-Label:** Can assign 1-3 tags (e.g., "Bollywood" + "Pop").
- **Batching:** Songs are batched (size: 75) to minimize RTT and handle large libraries efficiently.
- **Fallback:** If the API is unreachable, a regex-based `classifyLocally` function scans filenames for keywords.

### Smart Filter (`aiFilterService.ts`)
Enables semantic search by mapping natural language to file IDs.
- **System Prompt:** *"You are a music recommendation assistant. Return ONLY a JSON array of IDs that match the user's vibe."*
- **Validation:** Results are cross-referenced with the local SQLite cache to ensure no hallucinations occur.

---

## 5. Metadata & Artwork Strategy

Extracting artwork from 1000+ files can consume significant memory and storage if stored as Blobs in SQLite.
- **Extraction:** Performed using a Worklet or background task.
- **Caching:** Album art is saved as individual files in `FileSystem.cacheDirectory`.
- **Linking:** Only the local URI is stored in the database.
- **Optimization:** If a song has no embedded art, it uses a generated aesthetic placeholder based on its genre.

---

## 6. Peer-to-Peer (P2P) Sharing

The sharing module (`utils/networkServer.ts`) uses `react-native-tcp-socket` for high-speed local transfers.
1. **Discovery:** The sender starts a TCP server and displays a QR code containing their Local IP and Port.
2. **Handshake:** The receiver scans the QR, connects, and requests the specific file URI.
3. **Transfer:** Files are sent in chunked buffers to prevent memory overflows.
4. **Environment:** Optimized for Wi-Fi Direct and local LAN environments.

---

## 7. State Management (Context API)

- **`AudioPlayerContext`:** Controls the `expo-audio` instance, queue state, and playback lifecycle.
- **`GenreContext`:** Global store for the `genre_map`. Triggers UI refreshes after AI batch processing.
- **`PlaylistsContext`:** Reactive layer over the SQLite playlist tables.

---

## 8. Development & Performance

### Building the Native Client
Msick uses several native modules (`expo-sqlite`, `expo-audio`, `react-native-tcp-socket`) that are not available in Expo Go.
```bash
npx expo run:android
```

### Performance Targets
- **Initial Load:** < 2s for 1000 songs.
- **AI Classification:** ~30s for 500 songs (batched).
- **Filtering:** < 50ms lookup time via indexed SQLite queries.

---

## 9. Future Roadmap
- **Waveform Visualization:** Implementing JSI-based audio frequency analysis.
- **Cross-Platform:** iOS-specific permission handling and native UI refinements.
- **Local LLM:** Exploring `MLC-LLM` or `Llama.rn` for fully offline AI filtering.
