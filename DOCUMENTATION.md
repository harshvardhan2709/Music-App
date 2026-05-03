# Msick - Project Documentation

## 1. Overview
**Msick** is an advanced, local-first music player application built with React Native and Expo. It aims to elevate the local music listening experience by introducing AI-driven features like smart categorization, natural language filtering, and robust metadata extraction, seamlessly wrapped in a beautiful, highly-optimized user interface styled with TailwindCSS (NativeWind).

## 2. Core Features

### Local Music Playback
- Discovers and loads audio files directly from the device's local storage.
- Full playback controls: Play, Pause, Next, Previous, Seek, Shuffle, and Repeat Modes (Off, All, One).
- Lock screen integration and background audio support via `expo-audio`.

### AI-Driven Genre Classification
- Uses the **Groq API (Llama 3.1 8B/3.3 70B)** to automatically categorize songs into specific genres (e.g., Phonk, Party, Ringtone Worthy, English, Indian Music) based on their filenames.
- Batches API requests for optimization and handles rate limiting.
- Includes a lightning-fast offline fallback classifier based on hardcoded keywords for instances where the API is unavailable.

### AI Smart Filter
- Enables users to query their music library using natural language prompts (e.g., "Show me upbeat party songs" or "Chill music").
- Groq AI analyzes the prompt against local filenames to return a tailored playlist instantly.

### Rich Metadata & Album Art Extraction
- Extracts embedded ID3 tags, including song titles, artists, albums, and artwork using `music-metadata-browser`.
- Employs a robust `expo-file-system` caching strategy to store extracted album artwork locally, bypassing standard SQLite database size limitations and ensuring instantaneous image loading across sessions.

### Peer-to-Peer (P2P) File Sharing (WIP)
- Built-in local network server (using `react-native-tcp-socket`) to allow users to share tracks with other devices over the same local network without requiring an active internet connection.

## 3. Tech Stack & Architecture

- **Framework:** React Native, Expo, Expo Router (for navigation)
- **Styling:** TailwindCSS via NativeWind (v4)
- **State Management:** React Context API (Audio, Genres, Likes, Playlists, Sharing)
- **Audio Engine:** `expo-audio` / `expo-av`
- **AI Integration:** Groq API
- **Local Storage:** `expo-file-system`, `expo-sqlite` (Relational Database)
- **Legacy Storage:** `@react-native-async-storage/async-storage` (Migrated to SQLite)

## 4. Directory Structure

```text
Msick/
├── app/                  # Expo Router navigation (Tabs Architecture)
│   ├── (tabs)/           # Main Tab Navigator
│   │   ├── index/        # Home Stack (Home, Queue)
│   │   ├── library/      # Library Stack (All Songs, Playlists, Favorites)
│   │   └── features/     # Features Stack (AI Filter, Genre classification, Sharing)
├── components/           # Reusable UI components (SongImage, LikeButton, etc.)
├── context/              # Global state management providers
├── utils/                # Core business logic and services
│   ├── database.ts       # Centralized SQLite service
│   ├── aiFilterService.ts
│   ├── genreService.ts
│   ├── metadataUtils.ts
│   └── networkServer.ts
└── ...
```

## 5. Core Services Deep Dive

### `database.ts`
The backbone of Msick's persistent storage. Migrated from AsyncStorage to a fully relational SQLite implementation:
- **Metadata Cache:** Stores extracted track info (Title, Artist, Album, Artwork URI) for instantaneous loading.
- **Genre Map:** Persists AI-classified genres for all local songs.
- **Playlists:** Handles relational mapping between playlists and songs with custom sort orders.
- **Key-Value Store:** A flexible table for simple flags and settings, replacing standalone AsyncStorage keys.
- **Migration Engine:** Includes a one-time migration script that safely transfers user data from legacy AsyncStorage to the new SQLite schema.

### `genreService.ts`
Manages the AI-driven categorization of songs. It defines the standard `GENRE_LIST` and UI colors. When categorizing the library:
- **Data Payload:** The service extracts the `id` and `filename` from up to 100 local songs per batch.
- **Prompt Construction:** 
  - **System Prompt:** Instructs the LLM to act as a strict music genre classifier. It clearly outlines the definitions of each genre (e.g., strictly defining "Phonk" as drift phonk/memphis rap vs. general aggressive music, and detailing subgenres for "Indian Music" or "English"). It mandates that the model must respond *only* with raw JSON.
  - **User Prompt:** A formatted string containing the batched list of songs in the format `[ID] filename.mp3`.
- **Expected Output:** The LLM is configured with `response_format: { type: 'json_object' }` to return a JSON object mapping IDs to genres: `{"songId": "Genre"}`.
- **Persistence:** Results are stored in the SQLite `genre_map` table for high-performance retrieval.
- **Fallback:** Gracefully falls back to `classifyLocally` (a fast keyword matching algorithm) if the network fails.

### `aiFilterService.ts`
Powers the Smart Filter feature, allowing users to query their music using natural language.
- **Data Payload:** Extracts `id` and `filename` for all audio assets retrieved via `expo-media-library`.
- **Prompt Construction:**
  - **System Prompt:** Instructs the LLM to act as a music recommendation assistant. It enforces rules to return *only* a JSON array containing the IDs of songs whose filenames best match the user's request.
  - **User Prompt:** Combines the user's request with the formatted list of available local songs.
- **Expected Output:** Returns a JSON payload containing matched song IDs (e.g., `{"ids": ["id1", "id2"]}`).
- **Processing:** The service cross-references returned IDs with actual local assets to prevent hallucinations and returns full `MediaLibrary.Asset` objects to the UI.

### `metadataUtils.ts`
Responsible for reading metadata without blocking the UI thread. It processes file URIs to extract ID3 tags. It saves high-res artwork to the local cache directory using `expo-file-system`, while persisting textual metadata in the SQLite `metadata_cache` table.

### `networkServer.ts`
A TCP server/client implementation for P2P sharing. It dynamically finds the device's local IP, broadcasts availability, and handles chunked file transfers directly between devices on the LAN.

## 6. State Management (Context API)

- **`AudioPlayerContext`:** Central nervous system of the app. Manages the current queue, active song, playback state, shuffle array, and repeat modes. Interacts directly with the `expo-audio` engine.
- **`GenreContext`:** Holds the mapped genres for all songs. Ensures the UI across different screens updates when classification completes.
- **`LikesContext`:** Manages a persistent list of favorited tracks.
- **`PlaylistsContext`:** Manages user-created custom playlists.
- **`ShareContext`:** Manages the state of the local TCP server, connected peers, and file transfer progress.

## 7. Setup & Installation

**Prerequisites:**
- Node.js installed
- Android SDK / Emulator or physical device (as the app relies on custom native modules, it cannot be run in standard Expo Go).

**Steps:**
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file at the root and add your Groq API Key:
   `EXPO_PUBLIC_GROQ_API_KEY=your_key_here`
4. Build the development client onto your device/emulator:
   `npx expo run:android`
5. Once the build is installed, start the metro bundler:
   `npm start`

## 8. Known Limitations & Future Work

- **Performance Overheads:** Processing metadata for massive libraries (thousands of songs) on initial load can cause temporary UI blocking. We are exploring moving parsing to a separate native thread or JSI.
- **P2P Sharing:** The sharing mechanism is functional but requires better UI feedback for transfer failures and cross-platform (iOS) testing.
- **Waveform Visualization:** Future updates plan to include real-time waveform generation and visualization for the playback screen.
